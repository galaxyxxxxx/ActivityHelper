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
  onLoad: function (options) {
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
    this.getAllComments(aid);
    db.collection("activity")
      .where({
        _id: aid,
      })
      .get({
        success: (res) => {
          console.log(res.data[0], "wccc");
          this.setData({
            activity_detail: res.data[0] || {},
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
  checkRegister() {
    let query = {
      _openid: this.data.openid,
      activityID: this.data.activity_detail._id,
    };
    // console.log(query, 'wc')
    db.collection("register")
      .where(query)
      .get({
        success: (res) => {
          // console.log(res)
          this.setData({
            alreadyTaken: !!res.data.length,
          });
        },
      });
  },
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
      console.log(today, this.data.activity_detail);
      wx.showToast({
        title: "不在报名时间",
        icon: "none",
      });
      return;
    }
    db.collection("register").add({
      data: {
        _openid: this.data._openid,
        activityID: this.data.activity_detail._id,
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
  getAllComments(_id) {
    db.collection("userComment")
      .where({
        activityID: _id,
      })
      .get({
        success: (res) => {
          this.setData({
            comments: res.data,
          });
        },
      });
  },
  submitComment() {
    if (!this.data.comment_input) {
      wx.showToast({
        title: "您还没有输入",
        icon: "none",
      });
      return;
    }
    let data = {
      activityID: this.data.activity_detail._id,
      activityName: this.data.activity_detail.title,
      comment: this.data.comment_input,
      commentTime:
        new Date().getFullYear() +
        "/" +
        (new Date().getMonth() + 1) +
        "/" +
        new Date().getDate() +
        "",
    };
    db.collection("userComment").add({
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