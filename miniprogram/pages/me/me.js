<<<<<<< Updated upstream
var util = require('../../utils/util.js');
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const user = db.collection('user')
Page({

  data: {
    tabbar: 2,
    openid: '',
    role: 0,

    actCollected: [],
    actRegistered: [],
    actReleased: [],
  },

  getOpenid: function () {
    let that = this
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        let id = res.result.openid
        that.setData({
          openid: id
        })
      },
      fail: err => {
        console.error(err)
      }
    })
  },
  onShow: function () {
    // this.getTabBar().init();
    // tabbar
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        active: 2
      })
    }


    let openid = this.data.openid
    var that = this
    //加载收藏历史

    //加载参与历史
    db.collection('register').where({        //参与活动
      openid: openid
    }).get({
      success: res => {
        res.data.map(active => {
          db.collection('activity').where({
            _id: active.aid
          }).orderBy('actTimeBegin', 'desc')
            .get({
              success: res => {
                this.setData({
                  actRegistered: [...this.data.actRegistered, ...res.data],
                })
              },
              fail(err) {
                console.log("参与历史加载失败", err)
              }
            })
        })
      },
      fail(res) {
        console.log("fail", res)
      }
    })


    //加载发布历史
    db.collection('activity').where({           //发布活动
      _openid: openid
    }).orderBy('actTimeBegin', 'desc')
      .get({
        success(res) {
          console.log("成功加载发布历史", res)
          that.setData({
            actReleased: res.data
          })
          console.log("加载后的发布历史", actReleased)
        },
        fail(err) {
          console.log("fail", err)
        }
      })

  },
  onLoad: function (options) {
    this.getOpenid();
    user.where({
      _openid: this.data.openid
    }).get({
      success(res) {
        console.log("查到该用户啦", res)
        this.setData({
          role: res.data[0].role
        })
      }
    })
  },
  // 转至个人信息修改页
  edit() {
    let openid = this.data.openid
    wx.navigateTo({
      url: '../../packageA/info/info?openid=' + openid,
    })
  },
  // 转至设置页
  setting() {
    wx.navigateTo({
      url: '../../packageB/setting/setting',
    })
  },
  newActivity() {
    let openid = this.data.openid
    console.log("openid", openid)
    let role = this.data.role
    console.log("角色", role)
    if (role == 0) {
      wx.navigateTo({
        url: '../../packageB/newActivity/newActivity',
      })
    }
  },
  viewMore(e) {
    console.log(e)
  }

=======
var util = require('../../utils/util.js');
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const user = db.collection('user')
const app = getApp()
Page({

  data: {
    list: false, //标记三个tab列表是否显示；初始为false，待加载完毕role的属性再设置为true，不然显示tab会出错
    process: 0, //标记三个tab列表是否加载完毕；初始为0，每加载一个tab，process自增；待process为3时，再结束loading
    tabbar: 0,
    openid: '',
    role: 0,

    actCollected: [],
    actRegistered: [],
    actReleased: [],
  },

  onShow: function () {},

  onLoad: function (options) {
    // 底部tabbar 
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        active: 2
      })
    }

    var openid = this.data.openid
    var process = this.data.process
    var actCollected = this.data.actCollected
    var actRegistered = this.data.actRegistered
    var actReleased = this.data.actReleased
    var that = this

    wx.showLoading({
      title: '',
    })

    // 页面数据加载
    new Promise(function (resolve0, reject) {
        // 1 加载openid
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: res => {
            let id = res.result.openid
            that.setData({
              openid: id
            })
            resolve0()
          },
          fail: err => {
            console.error(err)
            resolve0()
          }
        })
      })
      .then(
        resolve0 => {
          // 2 加载用户role
          console.log("1", this.data.openid)
          new Promise(function (resolve1, reject) {
              console.log("调用openid", that.data.openid)
              let openid = that.data.openid
              user.where({
                _openid: openid
              }).get({
                success(res) {
                  console.log("查到该用户啦", res)
                  that.setData({
                      role: res.data[0].role
                    }),
                    resolve1()
                },
                fail(err) {
                  console.log("user表查询失败")
                }
              })
            })
            .then(
              resolve1 => {
                that.setData({
                  list: true
                })
                // 3.1 收藏历史
                new Promise(function (resolve21, reject) {
                    let openid = that.data.openid
                    db.collection('collect').where({
                        _openid: openid
                      }).orderBy('actTimeBegin', 'desc')
                      .get({
                        success(res) {
                          console.log("成功加载收藏历史", res)
                          resolve21(res)
                        },
                        fail(err) {
                          console.log("fail", err)
                        }
                      })
                  })
                  .then(
                    function resolve21(res) {
                      // 根据收藏表查到的aid 依次去活动信息表获取活动信息
                      new Promise(function (resolve3, reject) {
                          res.data.forEach(function (currentValue, index, arr) {
                            console.log("currentValue", index, currentValue)
                            db.collection('activity').where({
                                _id: currentValue.aid
                              })
                              .get({
                                success(res1) {
                                  console.log("测试获取到的活动详情", res1)
                                  actCollected.push(res1.data[0])
                                  if (index == arr.length - 1) {
                                    that.setData({
                                      actCollected
                                    })
                                    resolve3()
                                  }
                                },
                                fail(err) {
                                  console.log("未获取到活动详情", err)
                                }
                              })

                          })
                        })
                        .then(
                          resolve3 => {
                            that.setData({
                              process : process+1
                            })
                          },
                          
                        )
                    }
                  )

              }
            )
        }
      )

    // 加载收藏列表
    // let list1 = 'collect'
    // loadList(list1)
    // 加载参与历史
    // loadRegister()
    // 加载发布历史
    // loadReleased()

  },

  loadList(list) {
    new Promise(function (resolve0, reject) {
        let openid = that.data.openid
        db.collection(list).where({
            _openid: openid
          }).orderBy('actTimeBegin', 'desc')
          .get({
            success(res) {
              console.log("ttt成功加载收藏历史", res)
              resolve0(res)
            },
            fail(err) {
              console.log("fail", err)
            }
          })
      })
      .then(
        function resolve0(res) {
          // 根据收藏表查到的aid 依次去活动信息表获取活动信息
          res.data.forEach(function (currentValue, index, arr) {
            console.log("currentValue", index, currentValue)
            db.collection('activity').where({
                _id: currentValue.aid
              })
              .get({
                success(res1) {
                  console.log("ttt测试获取到的活动详情", res1)
                  actCollected.push(res1.data[0])
                  if (index == arr.length - 1) {
                    that.setData({
                      actCollected
                    })
                  }
                },
                fail(err) {
                  console.log("未获取到活动详情", err)
                }
              })
          })
        }
      )
  },

  cb: function (res) {
    let that = this
    that.setData({
      openid: res
    })
    console.log(that.data.openid)
  },
  // 转至个人信息修改页
  edit() {
    let openid = this.data.openid
    wx.navigateTo({
      url: '../../packageA/info/info?openid=' + openid,
    })
  },
  // 转至设置页
  setting() {
    wx.navigateTo({
      url: '../../packageB/setting/setting',
    })
  },
  newActivity() {
    let openid = this.data.openid
    console.log("openid", openid)
    let role = this.data.role
    console.log("角色", role)
    if (role == 1) {
      wx.navigateTo({
        url: '../../packageB/newActivity/newActivity?openid=' + openid,
      })
    }
  },
  viewMore(e) {
    console.log(e)
  }

>>>>>>> Stashed changes
})