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

    // 空状态插图
    emptyImg: 'data:image/svg+xml;base64,PHN2ZyBpZD0iYmFjM2NmYzctYjYxYi00OGNlLTg0NDEtODEwMGU0MGRkYWE2IiBkYXRhLW5hbWU9IkxheWVyIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9Ijc5Ny41IiBoZWlnaHQ9IjgzNC41IiB2aWV3Qm94PSIwIDAgNzk3LjUgODM0LjUiPjx0aXRsZT52b2lkPC90aXRsZT48ZWxsaXBzZSBjeD0iMzA4LjUiIGN5PSI3ODAiIHJ4PSIzMDguNSIgcnk9IjU0LjUiIGZpbGw9IiMzZjNkNTYiLz48Y2lyY2xlIGN4PSI0OTYiIGN5PSIzMDEuNSIgcj0iMzAxLjUiIGZpbGw9IiMzZjNkNTYiLz48Y2lyY2xlIGN4PSI0OTYiIGN5PSIzMDEuNSIgcj0iMjQ4Ljg5Nzg3IiBvcGFjaXR5PSIwLjA1Ii8+PGNpcmNsZSBjeD0iNDk2IiBjeT0iMzAxLjUiIHI9IjIwMy45OTM2MiIgb3BhY2l0eT0iMC4wNSIvPjxjaXJjbGUgY3g9IjQ5NiIgY3k9IjMwMS41IiByPSIxNDYuMjU5NTciIG9wYWNpdHk9IjAuMDUiLz48cGF0aCBkPSJNMzk4LjQyMDI5LDM2MS4yMzIyNHMtMjMuNzAzOTQsNjYuNzIyMjEtMTMuMTY4ODYsOTAuNDI2MTUsMjcuMjE1NjQsNDYuNTI5OTUsMjcuMjE1NjQsNDYuNTI5OTVTNDA2LjMyMTYsMzY1LjYyMTg2LDM5OC40MjAyOSwzNjEuMjMyMjRaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjAxLjI1IC0zMi43NSkiIGZpbGw9IiNkMGNkZTEiLz48cGF0aCBkPSJNMzk4LjQyMDI5LDM2MS4yMzIyNHMtMjMuNzAzOTQsNjYuNzIyMjEtMTMuMTY4ODYsOTAuNDI2MTUsMjcuMjE1NjQsNDYuNTI5OTUsMjcuMjE1NjQsNDYuNTI5OTVTNDA2LjMyMTYsMzY1LjYyMTg2LDM5OC40MjAyOSwzNjEuMjMyMjRaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjAxLjI1IC0zMi43NSkiIG9wYWNpdHk9IjAuMSIvPjxwYXRoIGQ9Ik00MTUuMTAwODQsNTE1Ljc0Njgycy0xLjc1NTg1LDE2LjY4MDU1LTIuNjMzNzcsMTcuNTU4NDcuODc3OTIsMi42MzM3NywwLDUuMjY3NTQtMS43NTU4NSw2LjE0NTQ3LDAsNy4wMjMzOS05LjY1NzE2LDc4LjEzNTIxLTkuNjU3MTYsNzguMTM1MjEtMjguMDkzNTYsMzYuODcyOC0xNi42ODA1NSw5NC44MTU3NmwzLjUxMTY5LDU4LjgyMDg5czI3LjIxNTY0LDEuNzU1ODUsMjcuMjE1NjQtNy45MDEzMmMwLDAtMS43NTU4NS0xMS40MTMtMS43NTU4NS0xNi42ODA1NXM0LjM4OTYyLTUuMjY3NTQsMS43NTU4NS03LjkwMTMxLTIuNjMzNzctNC4zODk2Mi0yLjYzMzc3LTQuMzg5NjIsNC4zODk2MS0zLjUxMTY5LDMuNTExNjktNC4zODk2Miw3LjkwMTMxLTYzLjIxMDUsNy45MDEzMS02My4yMTA1LDkuNjU3MTYtOS42NTcxNiw5LjY1NzE2LTE0LjkyNDcxdi01LjI2NzU0czQuMzg5NjItMTEuNDEzLDQuMzg5NjItMTIuMjkwOTMsMjMuNzAzOTQtNTQuNDMxMjcsMjMuNzAzOTQtNTQuNDMxMjdsOS42NTcxNiwzOC42Mjg2NCwxMC41MzUwOSw1NS4zMDkyczUuMjY3NTQsNTAuMDQxNjUsMTUuODAyNjIsNjkuMzU2YzAsMCwxOC40MzY0LDYzLjIxMDUxLDE4LjQzNjQsNjEuNDU0NjZzMzAuNzI3MzMtNi4xNDU0NywyOS44NDk0MS0xNC4wNDY3OC0xOC40MzY0LTExOC41MTk3LTE4LjQzNjQtMTE4LjUxOTdMNTMzLjYyMDU0LDUxMy45OTFaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjAxLjI1IC0zMi43NSkiIGZpbGw9IiMyZjJlNDEiLz48cGF0aCBkPSJNMzkxLjM5NjksNzcyLjk3ODQ2cy0yMy43MDM5NCw0Ni41My03LjkwMTMxLDQ4LjI4NTgsMjEuOTQ4MDksMS43NTU4NSwyOC45NzE0OC01LjI2NzU0YzMuODM5NjgtMy44Mzk2OCwxMS42MTUyOC04Ljk5MTM0LDE3Ljg3NTY2LTEyLjg3Mjg1YTIzLjExNywyMy4xMTcsMCwwLDAsMTAuOTY4OTMtMjEuOTgxNzVjLS40NjMtNC4yOTUzMS0yLjA2NzkyLTcuODM0NDQtNi4wMTg1OC04LjE2MzY2LTEwLjUzNTA4LS44Nzc5Mi0yMi44MjYtMTAuNTM1MDgtMjIuODI2LTEwLjUzNTA4WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIwMS4yNSAtMzIuNzUpIiBmaWxsPSIjMmYyZTQxIi8+PHBhdGggZD0iTTUyMi4yMDc1Myw4MDcuMjE3NDhzLTIzLjcwMzk0LDQ2LjUzLTcuOTAxMzEsNDguMjg1ODEsMjEuOTQ4MDksMS43NTU4NCwyOC45NzE0OC01LjI2NzU0YzMuODM5NjgtMy44Mzk2OSwxMS42MTUyOC04Ljk5MTM0LDE3Ljg3NTY2LTEyLjg3Mjg1YTIzLjExNywyMy4xMTcsMCwwLDAsMTAuOTY4OTMtMjEuOTgxNzVjLS40NjMtNC4yOTUzMS0yLjA2NzkyLTcuODM0NDQtNi4wMTg1Ny04LjE2MzY3LTEwLjUzNTA5LS44Nzc5Mi0yMi44MjYtMTAuNTM1MDgtMjIuODI2LTEwLjUzNTA4WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIwMS4yNSAtMzIuNzUpIiBmaWxsPSIjMmYyZTQxIi8+PGNpcmNsZSBjeD0iMjk1LjkwNDg4IiBjeT0iMjE1LjQzMjUyIiByPSIzNi45MDQ2MiIgZmlsbD0iI2ZmYjhiOCIvPjxwYXRoIGQ9Ik00NzMuNDMwNDgsMjYwLjMwODMyUzQ0Ny4wNywzMDguODExNTQsNDQ0Ljk2MTIsMzA4LjgxMTU0LDQ5Mi40MSwzMjQuNjI3ODEsNDkyLjQxLDMyNC42Mjc4MXMxMy43MDc0My00Ni4zOTQzOSwxNS44MTYyNi01MC42MTIwNloiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMDEuMjUgLTMyLjc1KSIgZmlsbD0iI2ZmYjhiOCIvPjxwYXRoIGQ9Ik01MTMuODY3MjYsMzEzLjM4NTRzLTUyLjY3NTQzLTI4Ljk3MTQ4LTU3Ljk0My0yOC4wOTM1Ni02MS40NTQ2Niw1MC4wNDE2Ni02MC41NzY3Myw3MC4yMzM5LDcuOTAxMzEsNTMuNTUzMzUsNy45MDEzMSw1My41NTMzNSwyLjYzMzc3LDkzLjA1OTkxLDcuOTAxMzEsOTMuOTM3ODMtLjg3NzkyLDE2LjY4MDU1Ljg3NzkzLDE2LjY4MDU1LDEyMi45MDkzMSwwLDEyMy43ODcyNC0yLjYzMzc3UzUxMy44NjcyNiwzMTMuMzg1NCw1MTMuODY3MjYsMzEzLjM4NTRaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjAxLjI1IC0zMi43NSkiIGZpbGw9IiNkMGNkZTEiLz48cGF0aCBkPSJNNTQzLjI3NzcsNTIxLjg5MjI4czE2LjY4MDU1LDUwLjkxOTU4LDIuNjMzNzcsNDkuMTYzNzMtMjAuMTkyMjQtNDMuODk2MTktMjAuMTkyMjQtNDMuODk2MTlaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjAxLjI1IC0zMi43NSkiIGZpbGw9IiNmZmI4YjgiLz48cGF0aCBkPSJNNDk4LjUwMzU5LDMxMC4zMTI2N3MtMzIuNDgzMTgsNy4wMjMzOS0yNy4yMTU2Myw1MC45MTk1NywxNC45MjQ3LDg3Ljc5MjM3LDE0LjkyNDcsODcuNzkyMzdsMzIuNDgzMTgsNzEuMTExODIsMy41MTE2OSwxMy4xNjg4NiwyMy43MDM5NC02LjE0NTQ3TDUyOC4zNTMsNDI1LjMyMDY3cy02LjE0NTQ3LTEwOC44NjI1My0xNC4wNDY3OC0xMTIuMzc0MjNBMzMuOTk5NjYsMzMuOTk5NjYsMCwwLDAsNDk4LjUwMzU5LDMxMC4zMTI2N1oiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMDEuMjUgLTMyLjc1KSIgZmlsbD0iI2QwY2RlMSIvPjxwb2x5Z29uIHBvaW50cz0iMjc3LjUgNDE0Ljk1OCAzMTcuODg1IDQ4Ni45NDcgMjgzLjg2IDQxMS4wOSAyNzcuNSA0MTQuOTU4IiBvcGFjaXR5PSIwLjEiLz48cGF0aCBkPSJNNTMzLjg5NiwyMzcuMzE1ODVsLjEyMi0yLjgyMDEyLDUuNjEwMSwxLjM5NjMyYTYuMjY5NzEsNi4yNjk3MSwwLDAsMC0yLjUxMzgtNC42MTUxM2w1Ljk3NTgxLS4zMzQxM2E2NC40NzY2Nyw2NC40NzY2NywwLDAsMC00My4xMjQ1LTI2LjY1MTM2Yy0xMi45MjU4My0xLjg3MzQ2LTI3LjMxODM3LjgzNzU2LTM2LjE4MiwxMC40MzA0NS00LjI5OTI2LDQuNjUzLTcuMDAwNjcsMTAuNTcwMTgtOC45MjIzMiwxNi42MDY4NS0zLjUzOTI2LDExLjExODIxLTQuMjYwMzgsMjQuMzcxOSwzLjExOTY0LDMzLjQwOTM4LDcuNTAwNiw5LjE4NTEzLDIwLjYwMiwxMC45ODQzOSwzMi40MDU5MiwxMi4xMjExNCw0LjE1MzI4LjQsOC41MDU4MS43NzIxNiwxMi4zNTQ1Ny0uODM5MjhhMjkuNzIxLDI5LjcyMSwwLDAsMC0xLjY1MzktMTMuMDM2ODgsOC42ODY2NSw4LjY4NjY1LDAsMCwxLS44Nzg3OS00LjE1MjQ2Yy41MjQ3LTMuNTExNjQsNS4yMDg4NC00LjM5NjM1LDguNzI3NjItMy45MjE5czcuNzQ5ODQsMS4yMDAzMSwxMC4wNjItMS40OTQzMmMxLjU5MjYxLTEuODU2MDksMS40OTg2Ny00LjU1OSwxLjcwOTY3LTYuOTk1NzVDNTIxLjI4MjQ4LDIzOS43ODUsNTMzLjgzNTg3LDIzOC43MDY1Myw1MzMuODk2LDIzNy4zMTU4NVoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yMDEuMjUgLTMyLjc1KSIgZmlsbD0iIzJmMmU0MSIvPjxjaXJjbGUgY3g9IjU1OSIgY3k9Ijc0NC41IiByPSI0MyIgZmlsbD0iIzgwYTBjMCIvPjxjaXJjbGUgY3g9IjU0IiBjeT0iNzI5LjUiIHI9IjQzIiBmaWxsPSIjODBhMGMwIi8+PGNpcmNsZSBjeD0iNTQiIGN5PSI2NzIuNSIgcj0iMzEiIGZpbGw9IiM4MGEwYzAiLz48Y2lyY2xlIGN4PSI1NCIgY3k9IjYyNC41IiByPSIyMiIgZmlsbD0iIzgwYTBjMCIvPjwvc3ZnPg==',
  },

  onLoad: function (options) {
    // 从缓存获取openid & role
    let that = this;
    that.setData({
      openid: wx.getStorageSync('openid'),
      role: wx.getStorageSync('role')
    })

    //加载历史
    setTimeout(() => {
      this.loadCollect();
    }, 300);

    setTimeout(() => {
      this.loadRegister();
    }, 300);

    setTimeout(() => {
      if (this.data.role == 1) {
        this.loadRelease();
      }
    }, 300);
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
    this.data.pageId = this.data.pageId + 1
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
                  console.log("报名列表加载失败", err)
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
                  console.log("报名列表加载失败", err)
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
    wx.stopPullDownRefresh();
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
                  console.log("报名列表加载失败", err)
                }
              })
          })
        },
        fail(res) {
          console.log("fail", res)
        }
      })
  },

  //加载报名列表
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
                  console.log("报名列表加载失败", err)
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

  // 查看活动详情
  viewMore(e) {
    console.log(e)
    if (e.mark == null) {
      console.log("已点击查看更多按钮 列表", e)
      wx.navigateTo({
        url: '../../packageA/activityDetail/activityDetail?aid=' + e.target.dataset.id,
      })
    }
  },

  // 点击发布列表 形成弹窗
  showPopupRelease(e) {
    if (e.mark.moreMark === "more") {
      this.setData({
        releaseSelect: e.currentTarget.dataset.moreid,
        showReleasePop: true
      })
    }

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
    if (e.mark.moreMark !== "more") {
      console.log("已点击查看更多按钮 列表", e)
      wx.navigateTo({
        url: '../../packageA/activityDetail/activityDetail?aid=' + e.currentTarget.dataset.id,
      })
    }
  },
})