var util = require('../../utils/util.js');
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

var cite = {};

Page({
  data: {
    openid: '',
    contact: '',
    formData: {
      title: '',
      host: '',
      contact: '',
      numMax: '',
      addr: '',
      addr1: '',
      addr2: '',
      type: '',
      actForm: '',
      actTimeBegin: '',
      actTimeEnd: '',
      regTimeBegin: '',
      regTimeEnd: '',
      description: '',
      coverUrl: '',
    },

    fileList: [],

    showAddr: false,
    showType: false,
    showActForm: false,

    actDate: '',
    showActDate: false,
    regDate: '',
    showRegDate: false,
    type: '',
    actForm: '报名',

    allAddr: [],
    allAddr1: [],
    address: [{
      values: [],
      defalutIndex: 0,
    }, {
      values: [],
      defalutIndex: 0,
    }],
    actType: [],
    actAvaliableForms: ['报名', '打卡']
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

    this.data.formData.contact = wx.getStorageSync('tel');
    // 取类别信息
    const types = await db.collection('type').get();
    Log('onLoad', 'types', types.data);
    const typeCollection = types.data.map(values => values.type_name);
    Log('typeCollection', typeCollection);
    this.setData({
      actType: types.data,
      typeCollection: typeCollection
    });

    // 取地址信息
    const places = await db.collection('place').get();
    const addr = places.data;
    let allAddr1 = addr.map(values => values.addr1);
    let pickerAddr = [{
      values: allAddr1,
      defalutIndex: 0,
    }, {
      values: addr[0].addr2,
      defalutIndex: 0,
    }];
    this.setData({
      allAddr: addr,
      allAddr1: allAddr1,
      address: pickerAddr
    });
    Log('addr', addr);
    for (let i = 0; i < addr.length; i++) {
      cite[addr[i].addr1] = addr[i].addr2;
    }
    Log('cite', cite);
    wx.hideLoading();
    Log('onLoad', 'formData', this.data.formData);
  },

  beforeRead(event) {
    const {
      file,
      callback
    } = event.detail;
    callback(file.type === 'image');
  },
  //上传活动图片
  afterRead(event) {
    const file = event.detail.file;
    this.data.fileList.unshift(file);
    const files = this.data.fileList;
    this.setData({
      fileList: files
    });
    this.uploadToCloud();
  },

  // 上传图片
  uploadToCloud() {
    const {
      fileList
    } = this.data;
    if (!fileList.length) {
      wx.showToast({
        title: '请选择图片',
        icon: 'none'
      });
    } else {
      console.log('Before Upload', fileList);
      var picRootPath = 'activityCover/' + new Date().getTime();
      let fileName = picRootPath + '.jpg';
      let chooseResult = fileList[0];
      var fileID = '';
      new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: fileName,
          filePath: chooseResult.path,
          success: res => {
            let form = this.data.formData;
            form.coverUrl = res.fileID;
            resolve(form);
          },
        });
      }).then(value => {
        this.setData({
          formData: value
        });
        return value.coverUrl;
      });
    }
  },

  // 删除图片
  deletePic(event) {
    console.log(event);
    let imgDelIndex = event.detail.index;
    let fileList = this.data.fileList;
    let form = this.data.formData;
    wx.cloud.deleteFile({
      fileList: [form.coverUrl],
    });
    fileList.splice(imgDelIndex, 1);
    console.log('删除图片的', fileList);
    this.setData({
      fileList: []
    });
  },

  // 活动地址选择
  showPopupAddr() {
    this.setData({
      showAddr: true,
    });
    console.log(this.data.addr);
    if (this.data.addr === undefined) {
      let choose = [];
      choose[0] = Object.keys(cite)[0];
      choose[1] = cite[choose[0]][0];
      let form = this.data.formData;
      form['addr'] = (choose[0] + choose[1]).toString();
      form['addr1'] = choose[0];
      form['addr2'] = choose[1];
      form['addr1_index'] = 0;
      form['addr2_index'] = 0;
      this.setData({
        formData: form,
        addr: choose[0] + choose[1]
      });
    }
  },
  onChangeAddr(e) {
    const {
      picker,
      value,
      index
    } = e.detail;
    console.log('On change', e);
    picker.setColumnValues(1, cite[value[0]]);
    this.setData({
      addr: value[0] + value[1]
    });
    var choice = [0, 0];
    let allAddr1 = this.data.allAddr1;
    choice[0] = this.getIndexByName(allAddr1, value[0]);
    choice[1] = this.getIndexByName(cite[value[0]], value[1]);
    console.log('choice', choice);
    let form = this.data.formData;
    form['addr'] = (value[0] + value[1]).toString();
    form['addr1'] = value[0];
    form['addr2'] = value[1];
    form['addr1_index'] = choice[0];
    form['addr2_index'] = choice[1];
    this.setData({
      formData: form
    });
  },

  getIndexByName(arr, target) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === target) {
        return i;
      }
    }
    return -1;
  },

  onCancelAddr(e) {
    this.setData({
      addr: null,
      addr1: null,
      addr2: null,
      showAddr: false,
    });
  },
  onCloseAddr() {
    this.setData({
      showAddr: false,
    });
  },
  // 活动类型选择
  showPopupType() {
    this.setData({
      showType: true,
    });
    console.log(this.data.type);
    if (this.data.type === '') {
      let allActType = this.data.actType;
      let form = this.data.formData;
      setTimeout(() => {
        form['type'] = allActType[0]._id;
        this.setData({
          formData: form,
          type: allActType[0].type_name
        });
      }, 300);
    }
  },
  onChangeType(e) {
    console.log('event', e.detail.value);
    console.log(e);
    this.setData({
      type: e.detail.value
    });
    let index = e.detail.index;
    let form = this.data.formData;
    form['type'] = this.data.actType[index]._id;
    this.setData({
      formData: form
    });
  },
  onCancelType() {
    this.setData({
      type: null,
      showType: false,
    });
  },
  onCloseType() {
    this.setData({
      showType: false,
    });
  },
  showPopupActForm() {
    this.setData({
      showActForm: true,
    });

  },
  onChangeActForm(e) {
    Log('onChangeActForm', e.detail.value);
    this.setData({
      actForm: e.detail.value
    });
    this.data.formData.actForm = e.detail.value;
  },
  hideActForm() {
    this.setData({
      showActForm: false,
    });
  },

  // 活动起止时间选择
  onDisplayActDate() {
    this.setData({
      showActDate: true
    });
  },
  onCloseActDate() {
    this.setData({
      showActDate: false
    });
  },
  onConfirmActDate(event) {
    const [start, end] = event.detail;
    this.setData({
      show: false,
      actDate: `${this.formatDate(start)} - ${this.formatDate(end)}`,
    });
    let form = this.data.formData;
    form['actTimeBegin'] = this.formatDate(event.detail[0]);
    form['actTimeEnd'] = this.formatDate(event.detail[1]);
    this.setData({
      formData: form
    });
    this.setData({
      showActDate: false
    });
  },

  // 报名起止时间选择
  onDisplayRegDate() {
    this.setData({
      showRegDate: true
    });
  },
  onCloseRegDate() {
    this.setData({
      showRegDate: false
    });
  },
  formatDate(date) {
    date = new Date(date);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = (date.getDate()).toString().padStart(2, '0');
    var time = year + '/' + month + '/' + day;
    return time;
  },
  onConfirmRegDate(event) {
    const [start, end] = event.detail;
    this.setData({
      show: false,
      regDate: `${this.formatDate(start)} - ${this.formatDate(end)}`,
    });
    let form = this.data.formData;
    form['regTimeBegin'] = this.formatDate(event.detail[0]);
    form['regTimeEnd'] = this.formatDate(event.detail[1]);
    this.setData({
      formData: form
    });
    this.setData({
      showRegDate: false
    });
  },

  //表单信息更改
  onFormChange(e) {
    console.log(e);
    let form = this.data.formData;
    form[`${e.currentTarget.dataset.field}`] = e.detail;
    this.setData({
      formData: form
    });
  },

  /**
     * 查看表单中的必填项是否已经填报
     * @param {object} form 表单
     */
  checkRequiredFields(form) {
    Log('必填项校验', form);
    const requiredFieldsCheckFailed =
            form.addr.length == 0 ||
            form.contact.length == 0 ||
            form.actTimeBegin.length == 0 ||
            form.regTimeBegin.length == 0 ||
            this.data.actAvaliableForms.indexOf(form.actForm) === -1 ||
            form.description.length == 0;
    if (requiredFieldsCheckFailed) {
      Log('必填项校验出错');
      throw new Error('有必填项尚未填写');
    }
  },

  /**
     * 检查标题长度
     * @param {string} title 标题
     */
  checkTitleLength(title) {
    Log('标题长度校验');
    const checkPassed = 0 < title.length && title.length <= 30;
    if (!checkPassed) {
      this.setData({
        title: ''
      });
      throw new Error('标题应为1-30个字符');
    }
  },

  /**
     * 检查报名人数上限
     * @param {number|string} numMax
     */
  checkRegisterNumberPositive(numMax) {
    Log('报名人数校验');
    if (numMax === '') {
      return;
    }
    const checkResult = util.checkRate(numMax);
    if (!checkResult) {
      Log('报名人数校验 出错');
      this.setData({
        numMax: ''
      });
      throw new Error('人数限制应为正整数');
    }
  },

  /**
     * 检查联系方式格式为手机号或邮箱
     * @param {string} contact 联系方式
     */
  checkContact(contact) {
    Log('联系方式校验');
    const checkResult = util.isTel(contact) || util.isEmail(contact);
    if (!checkResult) {
      Log('联系方式校验 出错');
      this.setData({
        contact: ''
      });
      throw new Error('联系方式格式不正确');
    }
  },

  /**
     * 这个函数提取了UGC安全校验的公共代码，使用form[field]的形式指定
     * 校验表单的字段。e.g. form[title]可以校验标题
     * @param {object} form 表单
     * @param {string} field 表单中检查的字段
     * @param {string} onFailToastTitle 检查不通过时弹出Toast窗口的选项
     */
  async checkTextUGC(form, field, onFailToastTitle) {
    Log('UGC安全校验', form[field]);
    await wx.cloud.callFunction({
      name: 'textsec',
      data: {
        text: form[field]
      }
    })
      .catch(() => {
        let data = {};
        data[field] = '';
        Log('UGC安全校验 setData', data);
        this.setData(data);
        throw new Error(onFailToastTitle);
      });
  },

  /**
     * 图片UCG安全校验
     * @param {string} coverUrl 图片url
     */
  async checkImageUGC(coverUrl) {
    console.log('图片校验');
    await wx.cloud.callFunction({
      name: 'imagesec',
      data: {
        img: coverUrl
      }
    })
      .catch(() => {
        wx.cloud.deleteFile({
          fileList: [coverUrl],
        });
        this.setData({
          fileList: []
        });
        throw new Error('图片存在敏感画面，请修改');
      });
  },

  // 表单信息校验
  async checkForm(form) {
    Log('进入校验');
    this.checkRequiredFields(form);
    this.checkTitleLength(form.title);
    await this.checkTextUGC(form, 'title', '活动名称存在敏感词汇');
    this.checkRegisterNumberPositive(form.numMax);
    this.checkContact(form.contact);
    await this.checkTextUGC(form, 'description', '概要介绍存在敏感词汇 请修改');
    await this.checkImageUGC(form.coverUrl);
  },

  //提交键 检查数据格式并上传至云数据库
  submit: async function (e) {
    Log('submit', e);
    let form = this.data.formData;
    form.host = this.data.host;
    console.log(form);
    wx.showLoading({
      title: '提交中......',
    });
    try {
      await this.checkForm(form);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({
        title: e.message,
        icon: 'none',
        duration: 3000
      });
      Log(e);
      return;
    }
    form.coverUrl = this.data.formData.coverUrl;
    const openid = this.data.openid;
    Log('cover url', form.coverUrl);
    const addResult = await db.collection('activity').add({
      data: {
        openid: openid,
        title: form.title,
        host: form.host,
        numMax: form.numMax,
        regNum: 0,
        contact: form.contact,
        addr: form.addr,
        addr1: form.addr1_index,
        addr2: form.addr2_index,
        type: form.type,
        actTimeBegin: form.actTimeBegin,
        actTimeEnd: form.actTimeEnd,
        regTimeBegin: form.regTimeBegin,
        regTimeEnd: form.regTimeEnd,
        description: form.description,
        cover: form.coverUrl,
        actForm: this.data.actAvaliableForms.indexOf(form.actForm)
      }
    });
    Log('added', addResult);
    wx.hideLoading();
    wx.showToast({
      title: '已成功发布',
      icon: 'success',
      duration: 1000
    });
    wx.redirectTo({
      url: `../../packageA/activityDetail/activityDetail?aid=${addResult._id}`,
    });
  },
});