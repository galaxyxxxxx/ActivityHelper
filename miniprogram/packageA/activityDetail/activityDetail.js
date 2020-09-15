var util = require('../../utils/util.js');
wx.cloud.init({
  env: "x1-vgiba",
});
const db = wx.cloud.database({
  env: "x1-vgiba",
});
Page({
  data: {
    openid: "",
    comment_input: "",
    comments: [],
    alreadyTaken: false,
    activity_detail: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
          if (raw != null) {
            console.log("rawdata", raw.actTimeBegin)
            raw.actTimeBegin = util.showTime(raw.actTimeBegin)
            raw.actTimeEnd = util.showTime(raw.actTimeEnd)
            console.log("raw.actTimeBegin", raw.actTimeBegin)
          }
          this.setData({
            activity_detail: raw || {},
          });
          wx.cloud.callFunction({
            name: "getopid",
            success: (res) => {
              let openid = "";
              try {
                openid = res.result.openid;
              } catch (error) {}
              openid ||
                wx.showToast({
                  title: "未登录",
                  icon: "none",
                });
              this.setData({
                openid: openid,
              });
              setTimeout(() => {
                openid ||
                  wx.navigateTo({
                    url: "/miniprogram/packageA/info/info",
                  });
              }, 1000);

              this.checkRegister();
            },
          });
        },
      });
  },
  // 报名检测
  checkRegister() {
    let query = {
      openid: this.data.openid,
      aid: this.data.activity_detail._id,
    };
    db.collection("register")
      .where(query)
      .get({
        success: (res) => {
          this.setData({
            alreadyTaken: !!res.data.length,
          });
        },
      });
  },
  // 报名
  submit() {
    let today = new Date();
    today = `${today.getFullYear()}/${
      today.getMonth() + 1 < 10
        ? "0" + (today.getMonth() + 1)
        : today.getMonth() + 1
    }/${today.getDate() < 10 ? "0" + today.getDate() : today.getDate()}`;
    if (
      this.data.activity_detail.actTimeBegin > today ||
      this.data.activity_detail.actTimeEnd < today
    ) {
      wx.showToast({
        title: "不在报名时间",
        icon: "none",
      });
      return;
    }
    db.collection("register").add({
      data: {
        aid: this.data.activity_detail._id,
      },
      success: (res) => {
        wx.showToast({
          title: "报名成功",
        });
        this.setData({
          alreadyTaken: true,
        });
      },  
    });
  },
  getComments(id) {
    db.collection('comment')
      .where({
        aid: id,
      })
      .limit(5)
      .get({
        success: (res) => {
          this.setData({
            comments: res.data,
          });
          console.log("获取评论成功", res.data)
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
});