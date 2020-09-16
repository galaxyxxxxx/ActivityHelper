App({
  globalData: {
    openid: '123'
  },
  onLaunch: async function () {
    //加载云函数
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'x1-vgiba',
        traceUser: true,
      })
      this.globalData = {}
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          this.globalData.openid = res.result.openid
          console.log(res.result.openid)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })
    }
  },
  //获取openid，由于网络延时，通常在其他页onload之后才会success,所以从其他页传回调函数cb进来。
  getopenid: function () {
    return new Promise((resolve, reject) => {
      var that = this
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          //闭包函数内，可以用this,而不需要用that=this
          that.globalData.openid = res.result.openid
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '获取 openid 失败，请检查 login 云函数',
          })
          console.log('[云函数] [login] 获取 openid 失败，请检查是否有部署云函数，错误信息：', err)
        },
      })
    })
  },
})