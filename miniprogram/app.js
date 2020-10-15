App({

  globalData: {
    openid: '',
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
  },

  // 获取openid
  getopenid: function (cb) {
    if (this.globalData.openid) {
      typeof cb == "function" && cb(this.globalData.openid)
    } else {
      // 调用云函数 获取openid
      var that = this
      wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: res => {
            //闭包函数内，可以用this,而不需要用that=this
            that.globalData.openid = res.result.openid
            // openid存入缓存 可以用7000s
            wx.setStorageSync('openid', res.result.openid)
            typeof cb == "function" && cb(that.globalData.openid)
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '获取 openid 失败，请检查 login 云函数',
            })
            console.log('[云函数] [login] 获取 openid 失败，请检查是否有部署云函数，错误信息：', err)
          },
        })
    }   
    
    setTimeout(() => {
      console.log("hi it's openid",that.globalData.openid)
      wx.cloud.database({
        env: 'x1-vgiba'
      }).collection('user').where({
        _openid: that.globalData.openid
      }).get({
        success(res) {
          // role记入缓存
          console.log("hi get role!",res.data[0].role)
          wx.setStorageSync('role', res.data[0].role)
          wx.setStorageSync('org', res.data[0].org)
        }
      })
    }, 2500);
  },

})