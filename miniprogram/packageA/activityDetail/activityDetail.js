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
    regNum: 0,
    defaultPic: 'cloud://x1-vgiba.7831-x1-vgiba-1302076395/activityCover/default.jpg',
    type: '',  //用于查询该类别的其他活动
    typeActList: []
  },

  getTypeActList(a) {
    console.log("type！", a)
    let today = new Date()
    db.collection('activity').where({
      type: a,
      _id: _.neq(this.data.aid)
    })
      .orderBy('actTimeBegin', 'desc')
      .limit(3)
      .get()
      .then(
        res => {
          console.log("同类别活动查询", res);
          this.setData({
            typeActList: res.data
          })
        }
      )
  },

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
    db.collection("activity").where({
      _id: aid,
    }).get({
      success: (res) => {
        console.log(res)
        var raw = res.data[0] || {}
        this.setData({
          activity_detail: raw || {},
          type: res.data[0].type
        });
        setTimeout(() => {
          this.getTypeActList(res.data[0].type);
        }, 200);
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
    });
    db.collection('register').where({
      aid: aid
    }).get().then(
      res => {
        let regNum = res.data.length;
        this.setData({
          regNum: regNum
        })
      },
    )
  },

  onShow: function () {
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
      let that = this;
      wx.showLoading({
        title: '正在取消...',
      });
      db.collection("register").doc(this.data.reg_id).remove({
        success: () => {
          this.setData({
            reg_id: '',
            alreadyTaken: false
          });
          db.collection('register').where({
            aid: that.data.activity_detail._id
          }).get().then(
            res => {
              let regNum = res.data.length;
              this.setData({
                regNum: regNum
              })
            },
          );
          db.collection('message').where({
            aid: this.data.activity_detail._id,
            touser: this.data.openid
          }).remove();
          wx.hideLoading()
          wx.showToast({
            title: "已取消报名",
            icon: "success",
            duration: 1500
          });
        }
      })
    } else {
      let that = this;
      wx.showLoading({
        title: '正在报名...',
      });
      let today = new Date();
      today = `${today.getFullYear()}/${today.getMonth() + 1 < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1}/${today.getDate() < 10 ? "0" + today.getDate() : today.getDate()}`;
      console.log("today", today, this.data.activity_detail)
      if (this.data.activity_detail.regTimeBegin > today || this.data.activity_detail.regTimeEnd < today) {
        wx.showToast({
          title: "不在报名时间",
          icon: "none",
        });
        return;
      }
      if (this.data.activity_detail.numMax <= this.data.regNum && this.data.activity_detail.numMax != '') {
        wx.showToast({
          title: "报名人数已满",
          icon: "none",
        });
        return;
      }
      console.log("regular Add");
      let lessonTmplId = ['w-vPBajcx_ej4CQ6QtmXduAbQT2scKZfN74E67Jj2ZQ', '8Dki6a-8B4bfGKfCgN2gUD9A4OFsb2c_hKoUv5gs2yA', 'CJpRUgZOMZEJVNUIc3-CfXiJXOoZzgd0qKynIeTu0wg'];  // 开始、取消、报名成功

      wx.requestSubscribeMessage({
        // 传入订阅消息的模板id，模板 id 可在小程序管理后台申请
        tmplIds: lessonTmplId,
        success(res) {
          console.log(res);
          // 申请订阅成功
          if (res.errMsg === 'requestSubscribeMessage:ok') {
            // 这里将订阅的课程信息调用云函数存入云开发数据
            let acting = that.data.activity_detail;
            console.log(acting);
            const promise1 = new Promise((resolve, reject) => {
              wx.cloud.callFunction({
                name: 'subscribe',
                data: {
                  openid: that.data.openid,
                  aid: acting._id,
                  data: {
                    thing4: { value: acting.title },
                    thing6: { value: acting.addr },
                    date3: { value: util.formatTimeMessage(new Date(acting.actTimeBegin)) },
                  },
                  date: new Date(),
                  templateId: lessonTmplId[0],
                }
              }).then(() => {
                resolve();
              })
            })
            const promise2 = new Promise((resolve, reject) => {
              wx.cloud.callFunction({
                name: 'subscribe',
                data: {
                  openid: that.data.openid,
                  aid: acting._id,
                  data: {
                    thing1: { value: acting.title },
                    thing3: { value: acting.addr },
                    date2: { value: util.formatTimeMessage(new Date(acting.actTimeBegin)) }
                  },
                  date: new Date(),
                  templateId: lessonTmplId[1],
                }
              }).then(() => {
                resolve();
              })
            })
            const promise3 = new Promise((resolve, reject) => {
              wx.cloud.callFunction({
                name: 'subscribe',
                data: {
                  openid: that.data.openid,
                  aid: acting._id,
                  data: {
                    thing1: { value: acting.title },
                    thing3: { value: acting.addr },
                    date5: { value: util.formatTimeMessage(new Date(acting.actTimeBegin)) },
                  },
                  date: new Date(),
                  templateId: lessonTmplId[2],
                }
              }).then(() => {
                resolve();
              })
            })
            Promise.all([promise1, promise2, promise3]).then(() => {
              console.log("all Promise");
              db.collection("register").add({
                data: {
                  aid: acting._id,
                  openid: that.data.openid
                },
                success: (res) => {
                  console.log("success reg res", res);
                  this.setData({
                    reg_id: res._id,
                    alreadyTaken: true,
                  });
                }
              });
              db.collection('register').where({
                aid: acting._id
              }).get().then(
                res => {
                  console.log("get regNum", res);
                  let regNum = res.data.length;
                  that.setData({
                    regNum: regNum,
                    alreadyTaken: true
                  });
                  wx.cloud.callFunction({
                    name: 'sendNewMsg',
                    data: {
                      aid: acting._id
                    },
                    success: () => {
                      wx.hideLoading();
                      wx.showToast({
                        title: '报名成功',
                        icon: 'success',
                        duration: 2000,
                      });
                    }
                  })
                })
            })
          } else {
            wx.showToast({
              title: '报名失败',
              icon: 'cancel',
              duration: 2000,
            });
          }
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
      wx.showLoading({
        title: '正在收藏...',
      });
      collect.add({
        data: {
          aid: aid,
          openid: openid
        },
        success: function (res1) {
          console.log(res1)
          wx.hideLoading();
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
      wx.showLoading({
        title: '正在取消...',
      });
      console.log("已被收藏，即将取消收藏")
      collect.where({
        aid: aid,
        _openid: openid
      }).get().then(res => {
        collect.doc(res.data[0]._id).remove({ //先查到该收藏记录的_id 再删除
          success(res) {
            console.log(res)
            console.log('已成功取消该收藏');
            wx.hideLoading();
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
  },

  moreTypeList() {
    let type = this.data.type
    wx.navigateTo({
      url: '../../packageA/list/list?type=' + type,
    })

  }
});