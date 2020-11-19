wx.cloud.init({
  env: 'x1-vgiba'
});
const db = wx.cloud.database({
  env: 'x1-vgiba'
});
const user = db.collection('user');
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
    emptyImg: '',
  },

  onLoad: function () {
    // 从缓存获取openid & role
    let that = this;
    that.setData({
      openid: wx.getStorageSync('openid'),
      role: wx.getStorageSync('role'),
      emptyImg: wx.getStorageSync('emptyImg')
    });
    wx.showLoading({
      title: '正在加载...',
    });
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
      wx.hideLoading();
    }, 300);
  },

  onShow: function () {
    // tabbar
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 2
      });
    }

    // data还原为初始值
    this.setData({
      releaseSelect: '',
      showReleasePop: false,
      actCollected: [],
      actRegistered: [],
      actReleased: [],
      pageId: 0,
    });

    //重新加载内容
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
      wx.hideLoading();
    }, 300);
  },

  // 滚动触底加载
  onReachBottom() {
    let openid = this.data.openid;
    this.data.pageId = this.data.pageId + 1;
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
                  });
                },
                fail(err) {
                  console.log('报名列表加载失败', err);
                }
              });
          });
        },
        fail(res) {
          console.log('fail', res);
        }
      });

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
                  });
                },
                fail(err) {
                  console.log('报名列表加载失败', err);
                }
              });
          });
        },
        fail(res) {
          console.log('fail', res);
        }
      });

    db.collection('activity').where({ //发布活动
      _openid: openid
    })
      .orderBy('actTimeEnd', 'desc')
      .skip(10 * this.data.pageId)
      .limit(10)
      .get({
        success: res => {
          console.log('成功加载发布管理', res);
          this.setData({
            actReleased: [...this.data.actReleased, ...res.data],
          });
          console.log('加载后的发布管理', this.data.actReleased);
        },
        fail(err) {
          console.log('fail', err);
        }
      });
  },

  // 下拉刷新
  onPullDownRefresh() {
    let that = this;
    that.setData({
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
    });
    this.onLoad();
    wx.stopPullDownRefresh();
  },

  // 获取用户角色
  setRole() {
    let that = this;
    user.where({
      _openid: that.data.openid
    }).get({
      success(res) {
        console.log('用户角色', res.data[0].role);
        // let role = that.data.role
        that.setData({
          role: res.data[0].role
        });
      }
    });
  },

  //加载收藏历史
  loadCollect() {
    let actCol = [];
    let openid = this.data.openid;
    let that = this;
    db.collection('collect').where({ //参与活动
      _openid: openid
    }).orderBy('actTimeEnd', 'desc')
      .limit(10)
      .get({
        success: res => {
          res.data.map(active => {
            db.collection('activity').where({
              _id: active.aid
            }).orderBy('actTimeBegin', 'desc')
              .get({
                success: res1 => {
                  let current = res1.data[0];
                  current.isCollected = true;
                  actCol.push(current);
                  that.setData({
                    actCollected: actCol
                  });
                },
                fail(err) {
                  console.log('收藏列表加载失败', err);
                }
              });
          });
        },
        fail(res) {
          console.log('fail', res);
        }
      });
  },

  //加载报名列表
  loadRegister() {
    let actReg = [];
    let openid = this.data.openid;
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
                success: res1 => {
                  actReg.push(res1.data[0]);
                  this.setData({
                    actRegistered: actReg,
                  });
                },
                fail(err) {
                  console.log('报名列表加载失败', err);
                }
              });
          });
        },
        fail(res) {
          console.log('fail', res);
        }
      });
  },

  //加载发布管理
  loadRelease() {
    let openid = this.data.openid;
    db.collection('activity').where({ //发布活动
      _openid: openid
    })
      .orderBy('actTimeEnd', 'desc')
      .limit(10)
      .get({
        success: res => {
          console.log('成功加载发布管理', res);
          this.setData({
            actReleased: res.data
          });
          console.log('加载后的发布管理', this.data.actReleased);
        },
        fail(err) {
          console.log('fail', err);
        }
      });
  },

  // 转换tab
  changeTab(e) {
    let that = this;
    if (e.detail.index == 0) {
      this.loadCollect();
      console.log('tabbbbb');
      that.setData({
        tabbar: e.detail.index
      });
    } else if (e.detail.index == 1) {
      this.loadRegister();
      console.log('tabbbbb');
      that.setData({
        tabbar: e.detail.index
      });
    } else if (e.detail.index == 2) { // 如果切换到发布管理页 让新建按钮晚一点儿出现
      console.log('taaaaaab', e.detail.index);
      setTimeout(() => {
        let that = this;
        that.setData({
          tabbar: e.detail.index
        });
      }, 200);
    }
  },
  // 转至个人信息修改页
  edit() {
    let openid = this.data.openid;
    wx.navigateTo({
      url: '../../packageA/info/info?openid=' + openid,
    });
  },
  // 转至设置页
  setting() {
    wx.navigateTo({
      url: '../../packageB/setting/setting',
    });
  },
  // 新建活动
  newActivity() {
    let openid = this.data.openid;
    console.log('openid', openid);
    let role = this.data.role;
    console.log('角色', role);
    if (role == 1) {
      wx.navigateTo({
        url: '../../packageB/newActivity/newActivity?openid=' + openid,
      });
    }
  },

  // 不知道为什么有两个viewMore，于是注释掉了第一个
  // // 查看活动详情
  // viewMore(e) {
  //     console.log(e);
  //     if (e.mark == null) {
  //         console.log('已点击查看更多按钮 列表', e);
  //         wx.navigateTo({
  //             url: '../../packageA/activityDetail/activityDetail?aid=' + e.target.dataset.id,
  //         });
  //     }
  // },

  // 点击发布列表 形成弹窗
  showPopupRelease(e) {
    if (e.mark.moreMark === 'more') {
      this.setData({
        releaseSelect: e.currentTarget.dataset.moreid,
        showReleasePop: true
      });
    }
  },
  // 选择发布列表
  onSelectRelease(e) {
    console.log('select', e);
    let aid = this.data.releaseSelect;
    this.setData({
      releaseSelect: '',
      showReleasePop: false
    });
    switch (e.detail.name) {
    case '活动详情':
      wx.navigateTo({
        url: '../../packageA/activityDetail/activityDetail?aid=' + aid,
      });
      break;
    case '活动删改':
      wx.navigateTo({
        url: '../../packageB/editActivity/editActivity?aid=' + aid,
      });
      break;
    case '报名统计':
      wx.navigateTo({
        url: '../../packageB/regDetails/regDetails?aid=' + aid,
      });
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
  editActivity() {},
  // 查看报名统计
  reg() {},
  // 查看活动详情
  viewMore(e) {
    if (e.mark.moreMark !== 'more' && e.mark.starMark !== 'star') {
      console.log('已点击查看更多按钮 列表', e);
      wx.navigateTo({
        url: '../../packageA/activityDetail/activityDetail?aid=' + e.currentTarget.dataset.id,
      });
    }
  },
  //点击收藏按钮的事件
  collect(e) {
    if (e.mark.starMark === 'star') {
      console.log('已点击收藏按钮', e);
      let that = this;
      var aid = e.currentTarget.dataset.collectid;
      var index = e.currentTarget.dataset.index;
      console.log('Collecting', aid, index);
      db.collection('collect').where({
        _openid: that.data.openid,
        aid: aid
      }).get({
        success: function (res) {
          console.log('收藏数据库查找成功', res);
          if (res.data.length == 0) { //如果未收藏，需要改为已收藏
            // 没用
            // collect.add({
            //     data: {
            //         aid: aid,
            //         openid: openid,
            //         collectTime: new Date()
            //     },
            //     success: function (res1) {
            //         console.log(res1);
            //         wx.showToast({
            //             title: '成功收藏',
            //             icon: 'success',
            //             duration: 1000
            //         });
            //         let tmp = that.data.actCollected;
            //         tmp[index].isCollected = true;
            //         that.setData({
            //             actCollected: tmp
            //         });
            //     }
            // });
          } else {
            console.log('已被收藏，即将取消收藏');
            db.collection('collect').doc(res.data[0]._id).remove({ //先查到该收藏记录的_id 再删除
              success(res) {
                console.log(res);
                console.log('已成功取消该收藏');
                wx.showToast({
                  title: '已取消收藏',
                  icon: 'success',
                  duration: 1000
                });
                let tmp = that.data.actCollected;
                tmp.splice(index, 1);
                // tmp[index].isCollected = false;
                that.setData({
                  actCollected: tmp
                });
              }
            });
          }
        }
      });
    }
  },
});