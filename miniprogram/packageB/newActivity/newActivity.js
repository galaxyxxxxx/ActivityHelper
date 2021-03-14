import {
  TagLog
} from '../../utils/taggedLog';
const Log = (...message) => {
  TagLog('packageB/newActivity', ...message);
};
wx.cloud.init({
  env: 'x1-vgiba'
});
const db = wx.cloud.database({
  env: 'x1-vgiba'
});
var util = require('../../utils/util.js');

Page({
  data: {
    openid: '',
    contact: '',
    host: ''
  },

  onLoad: async function () {
    wx.showLoading({
      title: '正在加载',
    });
    this.setData({
      openid: wx.getStorageSync('openid'),
      host: wx.getStorageSync('org'),
      contact: wx.getStorageSync('tel')
    });
    wx.hideLoading();
  },

  submit: async function () {
    const editor = this.selectComponent('#editor');
    wx.showLoading({
      title: '正在检查表单',
    });
    const form = await editor.getFormData(true);
    Log('sumbit form', form);
    if (form.err) {
      wx.hideLoading();
      wx.showToast({
        title: form.err,
        icon: 'none',
        duration: 3000
      });
      return;
    }
    wx.showLoading({
      title: '提交中......',
    });
    const openid = this.data.openid;
    const addResult = await db.collection('activity').add({
      data: {
        openid: openid,
        title: form.title,
        host: form.host,
        numMax: form.numMax,
        regNum: 0,
        contact: form.contact,
        addr: form.addr,
        addr1: form.addr1,
        addr2: form.addr2,
        type: form.type,
        actTimeBegin: form.actTimeBegin,
        actTimeEnd: form.actTimeEnd,
        regTimeBegin: form.regTimeBegin,
        regTimeEnd: form.regTimeEnd,
        clockinTimeBegin: form.clockinTimeBegin,
        clockinTimeEnd: form.clockinTimeEnd,
        description: form.description,
        cover: form.coverUrl,
        actForm: form.actForm
      }
    });
    Log('added', addResult);
    wx.hideLoading();
    wx.showToast({
      title: '已成功发布',
      icon: 'success',
      duration: 1000
    });
    var flag = await util.checkActivityType(addResult._id)
    wx.redirectTo({
        url: '../../packageA/' + flag,
    });
  },
});