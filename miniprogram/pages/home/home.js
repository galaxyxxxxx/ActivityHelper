let util = require('../../utils/util.js');
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const app = getApp()
const act = db.collection('activity')
const collect = db.collection('collect')
const _ = db.command

Page({
  data: {
    openid: "",

    // 顶部日期
    year: '',
    month: '',
    day: '',

    loading: false,

    //顶部主活动
    actMain: {},

    //活动集 | 正在进行的
    acting: [],

    // 标识当前page
    pageId: 0,
  },

  onLoad: function (options) {
    //设置回调，防止小程序globalData拿到空数据
    let that = this;
    app.getopenid(that.cb);

    // 时间栏显示
    this.showDate();
    // 加载今日日期 用于筛选未到期的活动
    let today = this.formatDate(new Date())

    var openid = this.data.openid
    var obj = {}
    // 加载主图
    act.where({
        actTimeEnd: _.gte(today)
      })
      .orderBy('actTimeBegin', 'desc')
      .limit(1)
      .get()
      .then(
        res => {
          obj = res.data[0]
          db.collection('register').where({
              aid: res.data._id
            })
            .get()
            .then(
              res3 => {
                obj.regNum = res.data.length
                this.setData({
                  actMain: obj
                })
              },
            )
        }
      )

    // 加载列表
    setTimeout(() => {
      console.log("openid ttt", that.data.openid)
      this.setData({
        loading: true
      })
      act.where({
          actTimeEnd: _.gte(today) //查找尚未到截止日期的活动
        })
        .orderBy('actTimeBegin', 'desc')
        .skip(1)
        .limit(5)
        .get()
        .then(
          res => {
            res.data.forEach(function (currentValue, index, arr) { // 对获取到的活动集一一添加是否收藏的属性
              // let that = this
              collect.where({
                  _openid: that.data.openid,
                  aid: currentValue._id
                })
                .get()
                .then(
                  res2 => {
                    currentValue.isCollected = res2.data.length == 1 ? true : false
                  },
                )

              db.collection('register').where({
                  aid: currentValue._id
                })
                .get()
                .then(
                  res3 => {
                    console.log("tttttt", currentValue, res3.data.length)
                    currentValue.regNum = res3.data.length
                  },
                )
            })

            setTimeout(() => {
              this.setData({
                acting: res.data //获取到活动的raw数据 直接赋值给acting
              })
            }, 500);
          }
        )
    }, 200);
  },
  // 一个用来获取openid的回调函数
  cb: function (res) {
    let that = this
    that.setData({
      openid: res
    })
  },

  // 滚动触底加载下一页活动
  onReachBottom() {
    let today = this.formatDate(new Date())
    this.data.pageId = this.data.pageId + 1
    act.where({
        actTimeEnd: _.gte(today) //查找尚未到截止日期的活动
      })
      .orderBy('actTimeBegin', 'desc')
      .skip(1 + 5 * this.data.pageId)
      .limit(5)
      .get()
      .then(
        res => {
          res.data.forEach(function (currentValue, index, arr) { // 对获取到的活动集一一添加是否收藏的属性
            collect.where({
                openid: currentValue.openid,
                aid: currentValue._id
              })
              .get()
              .then(
                res2 => {
                  currentValue.isCollected = res2.data.length > 0 ? true : false
                },
              )
          })
          setTimeout(() => {
            this.setData({
              acting: [...this.data.acting, ...res.data] //获取到活动的raw数据 直接赋值给acting
            })
          }, 700);
        }
      )
  },

  // 下拉刷新
  onPullDownRefresh() {
    let today = this.formatDate(new Date())
    this.setData({
      openid: "",

      // 顶部日期
      year: '',
      month: '',
      day: '',

      //顶部主活动
      actMain: {},

      //活动集 | 正在进行的
      acting: [],

      // 标识当前page
      pageId: 0,
    })
    this.onLoad()
  },

  onShow: function () {
    // 控制tabbar
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 0
      })
    }
  },

  //点击收藏按钮的事件
  collect(e) {
    if (e.mark.starMark === "star") {
      console.log("已点击收藏按钮", e)

      let that = this
      var aid = e.currentTarget.dataset.collectid
      var index = e.currentTarget.dataset.index
      let openid = that.data.openid
      console.log("Collecting", aid, index)
      collect.where({
        _openid: that.data.openid,
        aid: aid
      }).get({
        success: function (res) {
          console.log("收藏数据库查找成功", res)
          if (res.data.length == 0) { //如果未收藏，需要改为已收藏
            collect.add({
              data: {
                aid: aid,
                openid: openid
              },
              success: function (res1) {
                console.log(res1)
                wx.showToast({
                  title: '成功收藏',
                  icon: 'success',
                  duration: 1000
                })
                let tmp = that.data.acting
                tmp[index].isCollected = true
                that.setData({
                  acting: tmp
                })
              }
            })
          } else {
            console.log("已被收藏，即将取消收藏")
            collect.doc(res.data[0]._id).remove({ //先查到该收藏记录的_id 再删除
              success(res) {
                console.log(res)
                console.log('已成功取消该收藏');
                wx.showToast({
                  title: '已取消收藏',
                  icon: 'success',
                  duration: 1000
                })
                let tmp = that.data.acting
                tmp[index].isCollected = false
                that.setData({
                  acting: tmp
                })
              }
            })
          }
        }
      })
    }
  },
  //点击查看更多(MORE)，跳转至活动详情页
  viewMoreMain(e) {
    console.log("已点击查看更多按钮 主图", e)
    let that = this
    let aid = that.data.actMain._id
    console.log("当前点击的活动id为", aid)
    wx.navigateTo({
      url: '../../packageA/activityDetail/activityDetail?aid=' + aid,
    })
  },
  viewMore(e) {
    if (e.mark.starMark !== "star") {
      console.log("已点击查看更多按钮 列表", e)
      wx.navigateTo({
        url: '../../packageA/activityDetail/activityDetail?aid=' + e.currentTarget.dataset.id,
      })
    }
  },

  formatDate(date) {
    date = new Date(date);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = (date.getDate()).toString().padStart(2, '0');
    var time = year + "/" + month + "/" + day;
    return time;
  },
  showDate() {
    var timestamp = Date.parse(new Date());
    var today = new Date();
    var monthEnglish = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    this.setData({
      year: today.getFullYear(),
      month: monthEnglish[today.getMonth()],
      day: today.getDate() < 10 ? '0' + today.getDate() : today.getDate()
    })
  },
  linkToMe() {
    wx.navigateTo({
      url: '../../packageA/info/info?openid=' + this.data.openid,
    })
  }
})