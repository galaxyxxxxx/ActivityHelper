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
    a: 1,
    openid: "",

    // 顶部日期
    year: '',
    month: '',
    day: '',

    //顶部主活动
    actMain: {},

    //活动集 | 正在进行的
    acting: [],
  },

  onLoad: function (options) {
    //设置回调，防止小程序globalData拿到空数据
    let that = this;
    app.getopenid(that.cb);

    // 时间栏显示
    this.showDate();
    // 加载今日日期 用于筛选未到期的活动
    let today = this.formatDate(new Date())

    // 加载主图
    act.where({
      _id: "0d06a2fd5f282af60049935b10c59212"
    })
      .get()
      .then(
        res => {
          this.setData({
            actMain: res.data[0]
          })
        }
      )

    // 加载列表
    act.where({
      actTimeEnd: _.gte(today) //查找尚未到截止日期的活动
    })
      .get()
      .then(
        res => {
          this.setData({
            acting: res.data //获取到活动的raw数据 直接赋值给acting
          })
          this.data.acting.forEach(function (currentValue, index, arr) { // 对获取到的活动集一一添加是否收藏的属性
            collect.where({
              openid: currentValue.openid,
              aid: currentValue._id
            })
              .get()
              .then(
                res2 => {
                  currentValue.isCollected = res2.data.length > 0 ? true : false
                  var b = "arr[" + index + "]"
                  that.setData({
                    b: currentValue
                  })
                },
              )
          })
        }
      )
  },
  // 一个用来获取openid的回调函数
  cb: function (res) {
    let that = this
    that.setData({
      openid: res
    })
  },
  // 下拉刷新 (暂未改好)
  onPullDownRefresh() {
    // setTimeout(() => {
    //   // 模拟请求数据，并渲染
    //   var arr = self.data.dataList,
    //     max = Math.max(...arr);
    //   for (var i = max + 1; i <= max + 3; ++i) {
    //     arr.unshift(i);
    //   }
    //   self.setData({
    //     dataList: arr
    //   });
    //   // 数据成功后，停止下拉刷新
    //   wx.stopPullDownRefresh();
    // }, 1000);
  },
  // 触底刷新 (暂未改好)
  onReachBottom() {
    // var arr = this.data.dataList,
    //   max = Math.max(...arr);
    // if (this.data.count < 3) {
    //   for (var i = max + 1; i <= max + 5; ++i) {
    //     arr.push(i);
    //   }
    //   this.setData({
    //     dataList: arr,
    //     count: ++this.data.count
    //   });
    // } else {
    //   wx.showToast({
    //     title: '没有更多数据了！',
    //   })
    // }
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
      console.log("Collecting")
      let that = this
      let aid = e.currentTarget.dataset.collectid
      let openid = that.data.openid
      collect.where({
        _openid: openid,
        aid: aid
      }).get({
        success: function (res) {
          console.log("收藏数据库查找成功", res)
          if (res.data.length == 0) { //如果未收藏，需要改为已收藏
            collect.add({
              data: {
                aid: aid
              }
            })
            wx.showToast({
              title: '成功收藏',
              icon: 'success',
              duration: 1000
            })
            console.log("成功收藏")
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
              }
            })
          }
        }
      })
    }
  },
  // 下拉刷新
  onPullDownRefresh:function()
  {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this
    setTimeout(function()
    {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    },1500);
    var tin = that.data.reloadinfo
    that.onLoad(tin) 
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

  // 点击筛选按钮后 弹出模态框 进行条件筛选
  select(e) {

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
      url: '../../packageA/info/info',
    })
  }
})