App({
  //全局变量
  globalData:{
    openid: ''
  },
  //获取openid
  getOpenId: function(){
    let that = this
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log("成功获取云函数login",res)
        that.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error(err)
      }
    })
  },
  onLaunch: function () {
    //加载云函数
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'x1-vgiba',
        traceUser: true,
      })
    }
    this.getOpenId();
    console.log(this.globalData.openid)
  }
})