import {
  fetchActivities,
  collectOrUncollectActivity
} from '../../utils/common';
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const app = getApp()
const act = db.collection('activity')
const collect = db.collection('collect')
const user = db.collection('user')
const _ = db.command

const watcher = user.where({
  openid: wx.getStorageSync('openid')
}).watch({
  onChange(event) {
    console.log('userInfo change', event);
    if (event.docChanges !== undefined && event.docChanges[0].dataType === 'update') {
      if (event.docChanges[0].updatedFields.role == 1) {
        wx.cloud.callFunction({
          name: 'sendAuditMsg',
          data: {
            openid: wx.getStorageSync('openid')
          }
        }).then(() => {
          wx.setStorageSync('role', 1);
        })
      }
    }
  },
  onError(err) {}
});

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

  activityQueryConfig: function () {
    const today = this.formatDate(new Date());
    return {
      filter: {
        actTimeEnd: _.gte(today)
      },
      skip: 1 + this.data.pageId * 5,
      limit: 5,
      orderBy: {
        field: 'actTimeBegin',
        order: 'desc'
      }
    }
  },

  onLoad: async function (options) {
    //设置回调，防止小程序globalData拿到空数据
    let that = this;
    app.getopenid(that.cb);
    app.getAllPlace();
    app.getAllType();
    // 时间栏显示
    this.showDate();
    // 加载今日日期 用于筛选未到期的活动
    let today = this.formatDate(new Date())
    // 加载主图
    const mainActivity = await act.where({
        actTimeEnd: _.gte(today)
      }).orderBy('actTimeBegin', 'desc')
      .limit(1).get();

    const actMain = mainActivity.data[0]
    const mainRegNum = await db.collection('register').where({
      aid: actMain._id
    }).get();
    actMain.regNum = mainRegNum.data.length;
    this.setData({
      actMain
    });
    const activities = await fetchActivities(db, this.data.openid, this.activityQueryConfig());
    this.setData({
      acting: activities,
      loading: true,
      pageId: this.data.pageId + 1
    });
  },
  // 一个用来获取openid的回调函数
  cb: function (res) {
    let that = this
    that.setData({
      openid: res
    })
  },
  onShow: function () {},

  // 滚动触底加载下一页活动
  async onReachBottom() {
    const config = this.activityQueryConfig();
    const activities = await fetchActivities(db, this.data.openid, config);
    const newActing = [...this.data.acting, ...activities];
    this.setData({
      acting: newActing,
      pageId: this.data.pageId + 1
    })
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
    wx.stopPullDownRefresh()
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
  async collect(e) {
    console.log("已点击收藏按钮", e)
    const result = await collectOrUncollectActivity(db, e.detail.activityId, this.data.openid);
    let newActing = this.data.acting
    newActing[e.detail.index].isCollected = result;
    this.setData({
      acting: newActing
    })
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
  },
  search() {
    wx.navigateTo({
      url: '../../packageA/search/search',
    })
  }
})