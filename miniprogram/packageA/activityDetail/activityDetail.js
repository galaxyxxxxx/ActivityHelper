var util = require('../../utils/util.js');
wx.cloud.init({
  env: "x1-vgiba",
});
const db = wx.cloud.database({
  env: "x1-vgiba",
});
const app = getApp()
const _ = db.command
Page({
  data: {
    openid: "",
    comment_input: "",
    comments: [],
    alreadyTaken: false,
    activity_detail: {},
    defaultPic: 'cloud://x1-vgiba.7831-x1-vgiba-1302076395/activityCover/default.jpg'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //设置回调，防止小程序globalData拿到空数据
    let that = this;
    app.getopenid(that.cb);

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
    })
      .get()
      .then(
        res => {
          console.log("tset", res)
          if (res.data.length > 0) { //数据大于零 说明被报名过了
            this.setData({
              alreadyTaken: true
            })
          }
        }
      )
  },
  // 一个用来获取openid的回调函数
  cb: function (res) {
    let that = this
    that.setData({
      openid: res
    })
  },

  // 报名
  submit() {
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
    if (this.data.alreadyTaken == true) {
      wx.showToast({
        title: "已报名",
        icon: "none",
      });
      return;
    }

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
  },
  // 更新报名人数
  
  // 分享按钮
  onShareAppMessage(options) {
    var that = this;
    var form = this.data.activity_detail
    return {
      title: form.title,
      imageUrl: form.coverUrl,
      success: function (res) {
        // 转发成功
        that.shareClick();
      },
      fail: function (res) {
        // 转发失败
      }
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