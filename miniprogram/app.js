
App({
  globalData: {
    openid: '',
    cite: {},
    type: {}
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
      console.log("hi it's openid", that.globalData.openid)
      wx.cloud.database({
        env: 'x1-vgiba'
      }).collection('user').where({
        _openid: that.globalData.openid
      }).get({
        success(res) {
          // role记入缓存
          console.log("hi get role!", res.data[0].role)
          wx.setStorageSync('role', res.data[0].role)
          wx.setStorageSync('org', res.data[0].org)
          wx.setStorageSync('tel', res.data[0].tel)
        }
      })
    }, 2500);
  },

  getAllPlace() {
    let that = this
    if (wx.getStorageSync('allPlace') != undefined) {
      wx.cloud.database({
        env: 'x1-vgiba'
      }).collection('place').get().then(
        res => {
          let addr = res.data;
          let cite = {};
          for (let i = 0; i < addr.length; i++) {
            cite[addr[i].addr1] = addr[i].addr2;
          }
          console.log(cite);
          that.globalData.cite = cite;
          wx.setStorageSync('allPlace', cite)
        })
    }
  },
  getAllType() {
    let that = this
    if (wx.getStorageSync('allType') != undefined) {
      wx.cloud.database({
        env: 'x1-vgiba'
      }).collection('type').get().then(
        res => {
          let type = res.data;
          console.log(type);
          that.globalData.type = type;
          wx.setStorageSync('allType', type)
        })
    }
  }
})