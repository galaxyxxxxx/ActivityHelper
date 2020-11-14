import {
  TagLog
} from '../../utils/taggedLog';

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
    pageId: 0
  },

  activityQueryConfig: function () {
    return {
      filter: {
        type: this.data.type_id
      },
      limit: 5,
      skip: 5 * this.data.pageId,
      orderBy: {
        field: 'actTimeEnd',
        order: 'desc'
      }
    }
  },

  onLoad: async function (options) {
    this.setData({
      openid: wx.getStorageSync('openid'),
      pageId: 0,
      type_id: options.type
    });

    type.where({
      _id: this.data.type_id
    }).get().then(res => {
      myLog(res);
      this.setData({
        type_name: res.data[0].type_name
      })
    })
    const activities = await fetchActivities(db, this.data.openid, this.activityQueryConfig());
    this.setData({
      pageId: this.data.pageId + 1
    });
    const tmp = this.data.acting;
    this.setData({
      acting: [...tmp, ...activities]
    });
    myLog(`onLoad finished at ${Date.now().toString()}`);
  },

  /**
   * 点击收藏按钮的事件
   */
  async collect(e) {
    myLog(e);
    const result = await collectOrUncollectActivity(db, e.detail.activityId, this.data.openid);
    myLog(result);
    myLog(e.detail.index);
    let tmp = this.data.acting
    tmp[e.detail.index].isCollected = result;
    this.setData({
      acting: tmp
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

  // 滚动触底加载下一页活动
  async onReachBottom() {
    myLog('reached bottom');
    const activities = await fetchActivities(db, this.data.openid, this.activityQueryConfig());
    this.setData({
      pageId: this.data.pageId + 1
    });
    const tmp = this.data.acting;
    this.setData({
      acting: [...tmp, ...activities]
    });
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