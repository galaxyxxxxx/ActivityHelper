import {
  TagLog
} from '../../utils/taggedLog';

// packageA/list/list.js
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const act = db.collection('activity')
const type = db.collection('type')
const app = getApp()
const collect = db.collection('collect')
const _ = db.command
const myLog = (message) => {
  TagLog("PackageA/list", message);
};

Page({
  data: {
    openid: '',
    type_id: '',
    type_name: '',
    acting: [],
    // 标识当前page
    pageId: 0,
  },

  async fetchActivities() {
    const activities = await act.where({
        type: this.data.type_id,
        //actTimeEnd: _.gte(today) //查找尚未到截止日期的活动
      })
      .orderBy('actTimeEnd', 'desc')
      .skip(5 * this.data.pageId)
      .limit(5)
      .get();
    if (activities.data.length === 0) {
      return;
    }
    wx.showLoading({
      title: '正在加载活动',
      mask: true
    });
    this.data.pageId = this.data.pageId + 1

    for (const activity of activities.data) {
      const collected = await collect.where({
        _openid: this.data.openid,
        aid: activity._id
      }).get();

      myLog(collected.data);
      activity.isCollected = collected.data.length > 0;
      myLog(`set collection to ${collected.data.length > 0} for ${activity.title} at ${Date.now().toString()}`);

      const registedNumber = await db.collection('register').where({
        aid: activity._id
      }).get();

      activity.regNum = registedNumber.data.length;
      myLog(`set regNum for ${activity.title} at ${Date.now().toString()}`);
    };
    this.setData({
      acting: [...this.data.acting, ...activities.data] //获取到活动的raw数据 直接赋值给acting
    });
    wx.hideLoading();
  },

  onLoad: async function (options) {
    this.setData({
      openid: wx.getStorageSync('openid'),
      pageId: 0
    })
    let today = this.formatDate(new Date())

    let type_id = options.type
    this.setData({
      type_id: type_id
    })

    type.where({
      _id: type_id
    }).get().then(res => {
      myLog(res);
      this.setData({
        type_name: res.data[0].type_name
      })
    })
    this.fetchActivities();
    myLog(`onLoad finished at ${Date.now().toString()}`);
  },

  /**
   * 点击收藏按钮的事件
   */
  async collect(e) {
    myLog(e);
    const aid = e.detail.activityId
    const index = e.detail.index
    const openid = this.data.openid
    myLog("Collecting", aid, index)
    const collectionInfo = await collect.where({
      _openid: this.data.openid,
      aid: aid
    }).get();
    myLog(collectionInfo)
    if (collectionInfo.data.length == 0) { //如果未收藏，需要改为已收藏
      await collect.add({
        data: {
          aid: aid,
          openid: openid,
          collectTime: new Date()
        }
      });
      wx.showToast({
        title: '成功收藏',
        icon: 'success',
        duration: 1000
      });
      let tmp = this.data.acting
      tmp[index].isCollected = true
      this.setData({
        acting: tmp
      })
    } else {
      console.log("已被收藏，即将取消收藏")
      const res = await collect.doc(collectionInfo.data[0]._id)
        .remove();
      myLog(res);
      console.log('已成功取消该收藏');
      wx.showToast({
        title: '已取消收藏',
        icon: 'success',
        duration: 1000
      })
      let tmp = this.data.acting
      tmp[index].isCollected = false
      this.setData({
        acting: tmp
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

  // 滚动触底加载下一页活动
  async onReachBottom() {
    myLog('reached bottom');
    this.fetchActivities();
    myLog(this.data.acting);
  },

  // 下拉刷新
  onPullDownRefresh() {
    let today = this.formatDate(new Date())
    this.setData({
      openid: '',
      acting: [],
      // 标识当前page
      pageId: 0
    })
    this.onLoad({
      type: this.data.type_id
    });
    this.onShow();
  },

})