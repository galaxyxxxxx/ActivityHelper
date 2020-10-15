var util = require('../../utils/util.js');
wx.cloud.init({
  env: "x1-vgiba",
});
const db = wx.cloud.database({
  env: "x1-vgiba",
});
const app = getApp()
const collect = db.collection("collect")
const _ = db.command
Page({
  data: {
    openid: "",
    aid: "",
    comment_input: "",
    comments: [],
    isCollected: false,
    alreadyTaken: false,  //是否已报名
    reg_id: '',
    activity_detail: {},
    defaultPic: 'cloud://x1-vgiba.7831-x1-vgiba-1302076395/activityCover/default.jpg'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 设置回调，防止小程序globalData拿到空数据
    let that = this;
    // 单页模式
    if (options.scene != 1154) {
      // app.getopenid(that.cb);
      this.setData({
        openid: wx.getStorageSync('openid'),
      });
    }
    let aid = options.aid;
    if (!aid) {
      wx.showToast({
        title: "活动不存在",
        icon: "none",
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
      return;
    }
    this.setData({
      aid: aid
    })
    this.getComments(aid);
    db.collection("activity")
      .where({
        _id: aid,
      })
      .get({
        success: (res) => {
          var raw = res.data[0] || {}
          this.setData({
            activity_detail: raw || {},
          });
        },
      });

    // 查询报名情况
    console.log(aid)
    db.collection("register").where({
      aid: aid,
      openid: this.data.openid
    }).get()
      .then(
        res => {
          console.log("tset", res)
          if (res.data.length > 0) { //数据大于零 说明被报名过了
            this.setData({
              alreadyTaken: true, 
              reg_id: res.data[0]._id
            })
          }
        }
      )
    db.collection('collect').where({
      aid: aid,
      openid: this.data.openid
    }).get().then(res => {
      console.log("collect", res);
      if (res.data.length > 0) {
        this.setData({
          isCollected: true
        })
      }
    })
  },

  onShow: function () {
    wx.hideHomeButton({
      success: (res) => { },
    })
  },

  // 一个用来获取openid的回调函数
  // 暂时不再用到
  cb: function (res) {
    let that = this
    that.setData({
      openid: res
    })
  },

  // 报名
  onClickRegister() {
    // 查询user表
    db.collection('user').where({
      openid: this.data.openid
    }).get().then(
      res => {
        if (!res.data.length) {
          wx.showToast({
            title: '请先完善个人信息',
            time: 1500
          })
          setTimeout(() => {
            wx.hideToast()
            wx.navigateTo({
              url: `../info/info?openid=${this.data.openid}`,
            });
          }, 1500);
        }
      }
    )
    // 检测是否已报名
    if (this.data.alreadyTaken === true) {
      db.collection("register").doc(this.data.reg_id).remove({
        success: () => {
          this.setData({
            reg_id: '', 
            alreadyTaken: false
          })
        }
      })
    } else {
      let today = new Date();
      today = `${today.getFullYear()}/${today.getMonth() + 1 < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1}/${today.getDate() < 10 ? "0" + today.getDate() : today.getDate()}`;
      console.log("today", today, this.data.activity_detail)
      if (this.data.activity_detail.actTimeBegin > today || this.data.activity_detail.actTimeEnd < today) {
        wx.showToast({
          title: "不在报名时间",
          icon: "none",
        });
        return;
      }
      db.collection("register").add({
        data: {
          aid: this.data.activity_detail._id,
          openid: this.data.openid
        },
        success: (res) => {
          setTimeout(() => {
            this.updateRegNum();
          }, 1000)
          wx.showToast({
            title: "报名成功",
          });
          this.setData({
            alreadyTaken: true,
          });
        },
      });
    }
  },

  // 分享按钮
  onShareAppMessage(options) {
    var that = this;
    var form = this.data.activity_detail
    return {
      title: form.title,
      imageUrl: form.cover,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  // 分享到朋友圈
  onShareTimeline(options) {
    var that = this;
    var form = this.data.activity_detail
    return {
      title: form.title,
      imageUrl: form.cover,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '分享成功',
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  //点击收藏按钮的事件
  onClickStar(e) {
    let that = this
    let aid = that.data.aid
    let openid = that.data.openid
    if (this.data.isCollected === false) {
      console.log("已点击收藏按钮", e)
      collect.add({
        data: {
          aid: aid,
          openid: openid
        },
        success: function (res1) {
          console.log(res1)
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            duration: 1000
          });
          that.setData({
            isCollected: true
          })
        }
      })
    } else {
      console.log("已被收藏，即将取消收藏")
      collect.where({
        aid: aid,
        _openid: openid
      }).get().then(res => {
        collect.doc(res.data[0]._id).remove({ //先查到该收藏记录的_id 再删除
          success(res) {
            console.log(res)
            console.log('已成功取消该收藏');
            wx.showToast({
              title: '已取消收藏',
              icon: 'success',
              duration: 1000
            });
            that.setData({
              isCollected: false
            })
          }
        })
      })
    }
  },
  //获取评论
  getComments(id) {
    db.collection('comment')
      .where({
        aid: id,
      })
      .orderBy('time', 'desc')
      .limit(5)
      .get({
        success: (res) => {
          console.log("获取评论成功", res.data)
          var that = this
          var comments = that.data.comments
          that.setData({
            comments: [...comments, ...res.data]
          })
          // res.data.map(active => {
          //   that.setData({
          //     comments: [...comments, ...active]
          //   })
          // })
        },
      });
  },
  // 填写评论
  submitComment() {
    // 空值检测
    if (!this.data.comment_input) {
      wx.showToast({
        title: "您还没有输入",
        icon: "none",
      });
      return;
    }
    let data = {
      openid: this.data.openid,
      aid: this.data.activity_detail._id,
      comment: this.data.comment_input,
      time: util.formatTime(new Date())
    };
    db.collection("comment").add({
      data,
      success: (res) => {
        wx.showToast({
          title: "评论成功",
        });
        this.setData({
          comments: [...this.data.comments, data],
        });
        this.setData({
          comment_input: "",
        });
      },
    });
  },
  onChange(e) {
    this.setData({
      comment_input: e.detail,
    });
  },
  // 右上角分享
  onShareAppMessage(options) {
    var that = this;
    var form = this.data.activity_detail
    return {
      title: form.title,
      imageUrl: form.coverUrl,
      success: function (res) {
        // 转发成功
        that.shareClick();
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
});