import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import {
  TagLog
} from '../../utils/taggedLog';
const Log = (...message) => {
  TagLog('packageB/editActivity', ...message);
};
wx.cloud.init({
  env: 'x1-vgiba'
});
const db = wx.cloud.database({
  env: 'x1-vgiba'
});
const act = db.collection('activity');
var util = require('../../utils/util.js');

Page({
  data: {
    aid: ''
  },

  onLoad: async function (options) {
    wx.showLoading({
      title: '正在加载',
    });
    this.setData({
      openid: wx.getStorageSync('openid'),
      host: wx.getStorageSync('org')
    });
    const activity = await act.where({
      _id: options.aid
    }).get();
    const activityForm = activity.data[0];
    const activityRegisterRecord = await db.collection('register').where({
      aid: options.aid
    }).get();
    this.setData({
      aid: activityForm._id
    });
    const form = {
      title: activityForm.title,
      host: activityForm.host,
      regNum: activityRegisterRecord.data.length,
      numMax: activityForm.numMax,
      contact: activityForm.contact,
      addr1: activityForm.addr1,
      addr2: activityForm.addr2,
      addr: activityForm.addr,
      type: activityForm.type,
      actForm: activityForm.actForm,
      actTimeBegin: activityForm.actTimeBegin,
      actTimeEnd: activityForm.actTimeEnd,
      regTimeBegin: activityForm.regTimeBegin,
      regTimeEnd: activityForm.regTimeEnd,
      clockinTimeBegin: activityForm.clockinTimeBegin,
      clockinTimeEnd: activityForm.clockinTimeEnd,
      description: activityForm.description,
      coverUrl: activityForm.cover
    };
    this.selectComponent('#editor').setFormData(form);

    Log('fetched activity', activity);
    Log('fetch register record', activityRegisterRecord);
    wx.hideLoading();
  },

  //删除
  delete: async function () {
    const form = await this.selectComponent('#editor').getFormData(false);
    const regNum = form.regNum;
    let dontDelete = (regNum > 0) ? `已有${regNum}同学报名了，请谨慎删除！\n如确认撤销，将向这${regNum}名同学推送通知` : '';
    Dialog.confirm({
      title: '真的要撤销该活动吗！😱',
      message: dontDelete,
    }).then(async () => {
      Log('delete form', form);
      await wx.cloud.callFunction({
        name: 'sendDelMsg',
        data: {
          aid: this.data.aid
        },
      });
      await db.collection('register').where({
        aid: this.data.aid
      }).remove();
      await db.collection('activity').doc(this.data.aid).remove();
      this.triggerEvent('deleteImage');
      wx.showToast({
        title: '已成功撤销',
        icon: 'success',
        duration: 1000
      });
      wx.switchTab({
        url: '../../pages/me/me',
      });
    }).catch((e) => {
      Log('delete cancled', e);
    });
  },

  //提交键 检查数据格式并上传至云数据库
  submit: async function () {
    let that = this
    wx.showLoading({
      title: '正在检查表单'
    });
    const form = await this.selectComponent('#editor').getFormData(true);
    if (form.err) {
      wx.hideLoading();
      wx.showToast({
        title: form.err,
        icon: 'none',
        duration: 3000
      });
      return;
    }
    form.id = this.data.aid;
    Log('new form', form);
    wx.hideLoading();
    const regNum = form.regNum;
    const dontDelete = regNum > 0 ? '已有' + regNum + '同学报名了，请谨慎修改信息！' : '';
    Dialog.confirm({
      title: '确定要修改该活动吗！',
      message: dontDelete,
    }).then(async () => {
      wx.showLoading({
        title: '提交中......',
      });
      await wx.cloud.callFunction({
        name: 'updateActivity',
        data: {
          form
        }
      });
      wx.hideLoading();
      wx.showToast({
        title: '成功修改',
        icon: 'success',
        duration: 1000
      });
      wx.hideToast({
        success: () => {
          that.redirectToDetail()
        },
      });
    }).catch((e) => {
      Log('update cancled', e);
    });
  },

  redirectToDetail:async function(){
    var flag = await util.checkActivityType(this.data.aid)
    wx.redirectTo({
      url: '../../packageA/' + flag,
    });
  },
});