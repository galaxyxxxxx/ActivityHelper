let util = require('../../utils/util.js');
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const act = db.collection('activity')
const collect = db.collection('collect')
const _ = db.command

Page({
  data: {
    openid: "",
    collectIcon: 'star-o', // 收藏按钮的默认设置
    collectColor: '#80a0c0',
    isCollected: {},

    //今天的时间；需写一个函数，先调取当天日期，再转换格式进行setData，最后渲染到前端页面顶端的时间栏
    year: '',
    month: '',
    day: '',

    //活动集 | 正在进行的
    acting: [],

    //以下为测试的静态数据
    actMain: {
      id: 0,
      aid: '0d06a2fd5f282af60049935b10c59212',
      title: '这是一行测试长度最大值的数据',
      host: '新媒体',
      lable: ['文艺', '社交', '竞赛'],
      addr: '本部南操',
      regNum: 233,
      actTimeEnd: '2020/9/30',
      collect: 0
    },
  },

  onLoad: function (options) {},

  onShow: function () {
    // tabbar
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 0
      })
    }

    this.showDate();

    let openid = this.data.openid
    let today = this.formatDate(new Date())

    act.where({
        actTimeEnd: _.gt(today)
      })
      .get()
      .then(
        res => {
          this.setData({
            acting: res.data
          })
        },
      )
      .catch(console.error)
  },

  //点击收藏按钮的事件
  collect(e) {
    if (e.mark.starMark === "star") {
      console.log(e)
      console.log(openid)
      console.log("Collecting")
      let that = this
      let aid = e.currentTarget.dataset.collectid
      // 先获取活动索引(是数组的index，而非_id噢；因为点击事件event只能捕捉到这是acting数组的第几个，所以通过index去数组里找该活动的_id信息) 
      collect.where({
        _openid: openid,
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
  viewMore1(e) {
    console.log(e)
    let that = this
    let aid = that.data.actMain.aid
    console.log("当前点击的活动id为", aid)
    wx.navigateTo({
      url: '../../packageA/activityDetail/activityDetail?aid=' + aid,
    })
  },
  viewMore(e) {
    if (e.mark.starMark !== "star") {
      console.log(e)
      let id = e.currentTarget.dataset.id
      console.log(id)
      // console.log(this.data.acting)
      console.log("e", e)
      // let _id = this.data.acting[index]._id
      console.log("当前点击的活动id为", id)
      wx.navigateTo({
        url: '../../packageA/activityDetail/activityDetail?aid=' + id,
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