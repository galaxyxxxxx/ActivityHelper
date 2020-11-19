import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

wx.cloud.init({
  env: 'x1-vgiba'
});
const db = wx.cloud.database({
  env: 'x1-vgiba'
});
const user = db.collection('user');

Page({
  data: {
    openid: '',
    org: ''
  },

  onLoad: function (options) {
    this.setData({
      openid: wx.getStorageSync('openid')
    });
  },

  onChangeOrg(e) {
    console.log(e);
    this.setData({
      org: e.detail
    });
  },

  submit(e) {
    let that = this;
    wx.showLoading({
      title: '提交中',
    });
    const lessonTmplId = ['KWaC5p8fORBoPKNS04b__FdXVoQwLXcVc1R6NLP38o0'];
    wx.requestSubscribeMessage({
      // 传入订阅消息的模板id，模板 id 可在小程序管理后台申请
      tmplIds: lessonTmplId,
      success(res) {
        console.log(res);
        // 申请订阅成功
        if (res.errMsg === 'requestSubscribeMessage:ok') {
          // 这里将订阅的课程信息调用云函数存入云开发数据
          new Promise((resolve, reject) => {
            wx.cloud.callFunction({
              name: 'watchAudit',
              data: {
                openid: that.data.openid,
                data: {
                  phrase1: {
                    value: '审核通过'
                  },
                  thing2: {
                    value: that.data.org
                  },
                  date3: {
                    value: ''
                  },
                },
                date: new Date(),
                templateId: lessonTmplId[0],
              }
            }).then(() => {
              resolve();
            });
          }).then(() => {
            user.where({
              openid: that.data.openid
            }).update({
              data: {
                org: that.data.org,
                role: 2
              },
              success: function (res) {
                console.log('已成功将角色置2 并记录其部门信息');
                wx.hideLoading();
                wx.showToast({
                  title: '已成功提交申请',
                  icon: 'success',
                  duration: 2000
                });
                wx.setStorageSync('role', 2);
                setTimeout(() => {
                  wx.switchTab({
                    url: '../../pages/me/me',
                  });
                }, 2000);
              }
            });
          });
        } else {
          wx.showToast({
            title: '提交失败',
            icon: 'cancel',
            duration: 2000,
          });
        }
      },
      fail: function (err) {
        wx.showToast({
          title: '提交失败',
          icon: 'cancel',
          duration: 2000,
        });
        console.log(err);
      }
    });
  }
});