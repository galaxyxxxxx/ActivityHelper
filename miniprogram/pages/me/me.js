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
    tabbar: 0,
    openid: '',
    role: -1,

    releaseSelect: '',
    showReleasePop: false,

    releaseList: [{
        name: '活动详情'
      },
      {
        name: '活动删改'
      },
      {
        name: '报名统计'
      },
    ],

    actCollected: [],
    actRegistered: [],
    actReleased: [],

    // 标识当前page
    pageId: 0,
  },

  onLoad: function (options) {
    // 获取openid
    let that = this;
    app.getopenid(that.cb);

    // 加载用户角色
    setTimeout(() => {
      console.log("openid ttt", that.data.openid)
      this.setRole();
    }, 800);

    //加载历史
    setTimeout(() => {
      this.loadCollect();
    }, 800);

    setTimeout(() => {
      this.loadRegister();
    }, 1000);

    setTimeout(() => {
      if (this.data.role == 1) {
        this.loadRelease();
      }
    }, 1700);
  },

  // 获取openid的回调函数
  cb: function (res) {
    let that = this
    that.setData({
      openid: res
    })
    console.log(that.data.openid)
  },

  onShow: function () {
    // tabbar
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 2
      })
    }
  },

  // 滚动触底加载
  onReachBottom() {
    let openid = this.data.openid
    db.collection('collect').where({ //参与活动
        _openid: openid
      })
      .orderBy('actTimeEnd', 'desc')
      .skip(10 * this.data.pageId)
      .limit(10)
      .get({
        success: res => {
          res.data.map(active => {
            db.collection('activity').where({
                _id: active.aid
              }).orderBy('actTimeBegin', 'desc')
              .get({
                success: res => {
                  this.setData({
                    actCollected: [...this.data.actCollected, ...res.data],
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

      db.collection('register').where({ //参与活动
        _openid: openid
      })
      .orderBy('actTimeEnd', 'desc')
      .skip(10 * this.data.pageId)
      .limit(10)
      .get({
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

      db.collection('activity').where({ //发布活动
        _openid: openid
      })
      .orderBy('actTimeEnd', 'desc')
      .skip(10 * this.data.pageId)
      .limit(10)
      .get({
        success: res => {
          console.log("成功加载发布管理", res)
          this.setData({
            actReleased: [...this.data.actReleased, ...res.data],
          })
          console.log("加载后的发布管理", actReleased)
        },
        fail(err) {
          console.log("fail", err)
        }
      })
  },

  // 下拉刷新
  onPullDownRefresh() {
    let that = this
    that.setData({
      tabbar: 0,
      openid: '',
      role: -1,

      releaseSelect: '',
      showReleasePop: false,

      releaseList: [{
          name: '活动详情'
        },
        {
          name: '活动删改'
        },
        {
          name: '报名统计'
        },
      ],

      actCollected: [],
      actRegistered: [],
      actReleased: [],

      // 标识当前page
      pageId: 0,
    })
    this.onLoad()
  },

  // 获取用户角色
  setRole() {
    let that = this
    user.where({
      _openid: that.data.openid
    }).get({
      success(res) {
        console.log("用户角色", res.data[0].role)
        // let role = that.data.role
        that.setData({
          role: res.data[0].role
        })
      }
    })
  },

  //加载收藏历史
  loadCollect() {
    let openid = this.data.openid
    db.collection('collect').where({ //参与活动
        _openid: openid
      })
      .orderBy('actTimeEnd', 'desc')
      .limit(10)
      .get({
        success: res => {
          res.data.map(active => {
            db.collection('activity').where({
                _id: active.aid
              }).orderBy('actTimeBegin', 'desc')
              .get({
                success: res => {
                  this.setData({
                    actCollected: [...this.data.actCollected, ...res.data],
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
  },

  //加载参与历史
  loadRegister() {
    let openid = this.data.openid
    db.collection('register').where({ //参与活动
        _openid: openid
      })
      .orderBy('actTimeEnd', 'desc')
      .limit(10)
      .get({
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

  },

  //加载发布管理
  loadRelease() {
    let openid = this.data.openid
    db.collection('activity').where({ //发布活动
        _openid: openid
      })
      .orderBy('actTimeEnd', 'desc')
      .limit(10)
      .get({
        success: res => {
          console.log("成功加载发布管理", res)
          this.setData({
            actReleased: res.data
          })
          console.log("加载后的发布管理", actReleased)
        },
        fail(err) {
          console.log("fail", err)
        }
      })
  },

  // 转换tab
  changeTab(e) {

    if (e.detail.index == 2) { // 如果切换到发布管理页 让新建按钮晚一点儿出现
      console.log("taaaaaab", e.detail.index)
      setTimeout(() => {
        let that = this
        let tabbar = that.data.tabbar
        that.setData({
          tabbar: e.detail.index
        })
      }, 200);
    } else {
      console.log("tabbbbb")
      let that = this
      let tabbar = that.data.tabbar
      that.setData({
        tabbar: e.detail.index
      })
    }

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
  // 新建活动
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

  // 点击发布列表 形成弹窗
  showPopupRelease(e) {
    console.log("show", e)
    this.setData({
      releaseSelect: e.currentTarget.dataset.id,
      showReleasePop: true
    })
  },
  // 选择发布列表
  onSelectRelease(e) {
    console.log("select", e)
    let aid = this.data.releaseSelect
    this.setData({
      releaseSelect: '',
      showReleasePop: false
    });
    switch (e.detail.name) {
      case '活动详情':
        wx.navigateTo({
          url: '../../packageA/activityDetail/activityDetail?aid=' + aid,
        })
        break;
      case '活动删改':
        wx.navigateTo({
          url: '../../packageB/editActivity/editActivity?aid=' + aid,
        })
        break;
      case '报名统计':
        wx.navigateTo({
          url: '../../packageB/regDetails/regDetails?aid=' + aid,
        })
        break;
      default:
        break;
    }
  },
  onCloseRelease() {
    this.setData({
      releaseSelect: '',
      showReleasePop: false
    });
  },

  // 修改活动
  editActivity(e) {

  },
  // 查看报名统计
  reg(e) {

  },
  // 查看活动详情
  viewMore(e) {
    console.log(e)
  }
})