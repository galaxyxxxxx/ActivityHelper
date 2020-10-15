import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const user = db.collection('user')

Page({

  data: {
    openid: '',
    org: ''
  },

  onLoad: function (options) {
    this.setData({
      openid: wx.getStorageSync('openid')
    })
  },

  onChangeOrg(e) {
    console.log(e)
    this.setData({
      org : e.detail
    })
  },

  submit(e){
    wx.showLoading({
      title: '提交中',
    })
    user.where({
      openid : openid
    })
    .update({
      data:{
        org: org,
        role: 2
      },
      success: function(res){
        console.log("已成功将角色置2 并记录其部门信息")
        wx.hideLoading()
        wx.navigateBack({
          delta: 1,
        })
      }
    })
  }

})