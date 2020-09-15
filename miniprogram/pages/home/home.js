import util from '../../utils/util.js';
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const act = db.collection('activity')
const collect = db.collection('collect')
const _ = db.command
const app = getApp()

Page({
  data: {
    openid: "",
    collectIcon: 'star-o', // 收藏按钮的默认设置
    collectColor: '#80a0c0',

    //今天的时间；需写一个函数，先调取当天日期，再转换格式进行setData，最后渲染到前端页面顶端的时间栏
    year: '',
    month: '',
    day: '',

    //活动集 | 正在进行的
    acting: [],

    //以下为测试的静态数据
    actMain: {},
  },

  onLoad: function (options) {
    this.getOpenid()
    // app.getopenid().then(res => {
    //   console.log('loadOpenId', res);
    // })
  },
  onShow: function () {
    // let openid = app.globalData.openid
    // 控制tabbar
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 0
      })
    }
    // 时间栏显示
    this.showDate();
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
      this.loadActivities()
  },

  loadActivities() {
    let today = this.formatDate(new Date())
    // 加载列表
    act.where({
      actTimeEnd: _.gt(today)
    })
    .get()
    .then(
      res => {
        this.setData({
          acting: res.data
        })
        console.log('acting', res.data)
        this.data.acting.forEach(function (value, index, acting) {
          collect.where({
            aid: value._id,
            _openid: this.data.openid
          })
          .get()
          .then(
            res => {
              acting[index].isCollected = true
              console.log(acting[index])
            }
          )
        })
      }
    )
  },

  //点击收藏按钮的事件
  collect(e) {
    if (e.mark.starMark === "star") {
      console.log(e)
      console.log(this.data.openid)
      console.log("Collecting")
      let that = this
      let aid = e.currentTarget.dataset.collectid
      // 先获取活动索引(是数组的index，而非_id噢；因为点击事件event只能捕捉到这是acting数组的第几个，所以通过index去数组里找该活动的_id信息) 
      collect.where({
        _openid: this.data.openid,
        aid: aid
      }).get({
        success: function (res) {
          console.log(res)
          if (res.data.length == 0) { //如果未收藏，需要改为已收藏
            collect.add({
              data: {
                aid: aid
              }
            })
            that.data.isCollected[aid] = true
          } else { //如果已收藏，需要改为未收藏
            // this.setData({
            //   pattern: 'star-o',
            //   color: '#80a0c0',
            // })
            collect.where({ //再更新数据库的收藏表
              _id: res.data._id,
              openid: openid
            }).remove({ //先查到该收藏记录的_id 再删除
              success(res) {
                console.log(res)
                console.log('已成功取消该收藏');
                that.data.isCollected[aid] = false
                wx.showToast({
                  title: '已取消收藏',
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
    console.log(e)
    let that = this
    let aid = that.data.actMain._id
    console.log("当前点击的活动id为", aid)
    wx.navigateTo({
      url: '../../packageA/activityDetail/activityDetail?aid=' + aid,
    })
  },
  viewMore(e) {
    console.log(e)
    if (e.mark.starMark !== "star") {
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
        return id
      },
      fail: err => {
        console.error(err)
      }
    })
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