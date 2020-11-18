import {
  TagLog
} from '../../utils/taggedLog';
const util = require('../../utils/util');
const Log = (...message) => {
  TagLog('components/activity-editor', ...message);
};

Component({
  properties: {
    title: String,
    host: String,
    contact: String,
    regNum: String,
    numMax: String,
    addr: String,
    addr1: Number,
    addr2: Number,
    type: String,
    actForm: String,
    actTimeBegin: String,
    actTimeEnd: String,
    regTimeBegin: String,
    regTimeEnd: String,
    description: String,
    coverUrl: String,
  },

  data: {
    // 表单数据
    title: '', // 活动名称
    host: '', // 举办部门
    contact: '', // 联系方式
    regNum: '', // 报名人数
    numMax: '', // 人数上限
    addr: '', // 活动地址
    addr1: 0, // 活动地址下标（校区）
    addr2: 0, // 活动地址下标（具体地址）
    type: '', // 活动类别id
    actForm: '', // 活动形式
    actTimeBegin: '', // 活动开始时间
    actTimeEnd: '', // 活动结束时间
    regTimeBegin: '', // 报名开始时间（仅当活动类型为报名时有效）
    regTimeEnd: '', // 报名结束时间（仅当活动类型为报名时有效）
    description: '', // 活动概要介绍
    coverUrl: '', // 活动封面链接

    // 展示数据
    imageList: [], // 活动封面，van-uploader要求是一个数组，其实只有一个元素
    typeName: '', // 活动类别名称
    allTypes: [], // 所有活动形式
    allTypeNames: [], // 所有活动类别名称
    allCampusAddress: [], // 所有校区地址
    allDetailedAddress: {}, // 所有具体地址，以<校区，校区对应具体地址>的键值对形式存储
    allActForms: ['报名', '打卡'], // 所有活动形式，以后可能也会从服务器获取

    popupAddressList: [{
      values: [],
      defaultIndex: 0
    }, {
      values: [],
      defaultIndex: 0
    }], // 活动地址选择器中显示的地址，第0号元素为所有校区地址，第1号元素为选中的校区对应的具体地址

    actDateStr: '', // 活动起止时间，如：2020/11/18 - 2020/11/19
    regDateStr: '', // 报名起止时间，同上。

    // 选择框控制变量
    showAddr: false, // 显示活动地址选择器
    showType: false, // 显示活动类别选择器
    showActForm: false, // 显示活动形式选择器
    showActDate: false, // 显示活动起止时间选择器
    showRegDate: false // 显示报名起止时间选择器

  },

  lifetimes: {
    attached: function () {
      const detailed = wx.getStorageSync('allPlace');
      const campus = Object.keys(detailed);

      const pickerAddr = [{
        values: campus,
        defalutIndex: 0,
      }, {
        values: detailed[campus[0]],
        defalutIndex: 0,
      }];
      const allTypes = wx.getStorageSync('allType');

      this.setData({
        popupAddressList: pickerAddr,
        allCampusAddress: campus,
        allDetailedAddress: detailed,
        allTypes: allTypes,
        allTypeNames: allTypes.map(t => t.type_name)
      });
      Log('onAttached', this.data);

    }
  },

  methods: {
    checkImageSizeAndType(e) {
      const {
        file,
        callback
      } = e.detail;
      Log(e);
      const isImage = file.type === 'image';
      const lessThan2mb = file.size < 2048 * 1024;
      if (!isImage) {
        wx.showToast({
          title: '该文件不是图片，请重新选择',
          icon: 'none',
          duration: 3000
        });
      }
      // 直接使用max-size属性不会有任何提示，所以使用before-read事件
      if (!lessThan2mb) {
        wx.showToast({
          title: '图片过大，请将大小限制在2mb',
          icon: 'none',
          duration: 3000
        });
      }
      callback(isImage && lessThan2mb);
    },

    async displayAndUploadImage(e) { // 看起来不能使用async函数
      Log('afterRead', e);
      const file = e.detail.file;
      this.setData({
        imageList: [file]
      });

      const uploadResult = await wx.cloud.uploadFile({
        cloudPath: 'activityCover/' + new Date().getTime() + '.jpg',
        filePath: file.path
      });
      Log('upload result', uploadResult);
      if (uploadResult.statusCode.toString().startsWith('2')) {
        this.setData({
          coverUrl: uploadResult.fileID
        });
        return;
      }
      wx.showToast({
        title: '图片上传失败',
        icon: 'none',
        duration: 3000
      });
      this.setData({
        imageList: []
      });
    },

    deleteImage() {
      this.setData({
        imageList: []
      });
      wx.cloud.deleteFile({
        fileList: [this.data.coverUrl],
      });
    },

    onFormChange(e) {
      Log('form change', e);
      const field = e.target.dataset.field;
      const data = {};
      data[field] = e.detail;
      this.setData(data);
    },

    showPopup(field) {
      const data = {};
      data[field] = true;
      this.setData(data);
    },

    hidePopup(field) {
      const data = {};
      data[field] = false;
      this.setData(data);
    },
    showPopupAddr() {
      this.showPopup('showAddr');
      if (this.data.addr === '') {
        const campus = this.data.allCampusAddress[0];
        const detailed = this.data.allDetailedAddress[campus][0];
        this.setData({
          addr: campus + detailed,
          addr1: this.data.allCampusAddress.indexOf(campus),
          addr2: this.data.allDetailedAddress[campus].indexOf(detailed)
        });
      }
    },
    onCloseAddr() {
      this.hidePopup('showAddr');
    },
    showPopupType() {
      this.showPopup('showType');
      if (this.data.type === '') {
        this.setData({
          type: this.data.allTypes[0]._id,
          typeName: this.data.allTypes[0].type_name
        });
      }
    },
    onCloseType() {
      this.hidePopup('showType');
    },
    showPopupActForm() {
      this.showPopup('showActForm');
      if (this.data.actForm === '') {
        this.setData({
          actForm: this.data.allActForms[0]
        });
      }
    },
    onCloseActForm() {
      this.hidePopup('showActForm');
    },
    showPopupActDate() {
      this.showPopup('showActDate');
    },
    onCloseActDate() {
      this.hidePopup('showActDate');
    },
    showPopupRegDate() {
      this.showPopup('showRegDate');
    },
    onCloseRegDate() {
      this.hidePopup('showRegDate');
    },
    onCancelAddr() {
      this.setData({
        addr: '',
        addr1: 0,
        addr2: 0,
        showAddr: false
      });
    },
    onCancelType() {
      this.setData({
        type: '',
        showType: false
      });
    },
    onCancelActForm() {
      this.setData({
        showActForm: false,
        actForm: ''
      });
    },
    onChangeAddr(e) {
      Log(e);
      const {
        picker,
        value
      } = e.detail;
      picker.setColumnValues(1, this.data.allDetailedAddress[value[0]]);
      this.setData({
        addr: value[0] + value[1],
        addr1: this.data.allCampusAddress.indexOf(value[0]),
        addr2: this.data.allDetailedAddress[value[0]].indexOf(value[1])
      });
    },
    onChangeType(e) {
      this.setData({
        type: this.data.allTypes[e.detail.index]._id,
        typeName: this.data.allTypes[e.detail.index].type_name
      });
    },
    onChangeActForm(e) {
      this.setData({
        actForm: e.detail.value
      });
    },
    onConfirmActDate(e) {
      Log(e);
      const [start, end] = e.detail.map(util.formatDate);
      this.setData({
        actDateStr: `${start} - ${end}`,
        actTimeBegin: start,
        actTimeEnd: end,
        showActDate: false
      });
    },
    onConfirmRegDate(e) {
      Log(e);
      const [start, end] = e.detail.map(util.formatDate);
      this.setData({
        regDateStr: `${start} - ${end}`,
        regTimeBegin: start,
        regTimeEnd: end,
        showRegDate: false
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
        // form.regTimeBegin.length == 0 || 活动类型为“打卡”时可能未选择注册时间
        this.data.allActForms.indexOf(form.actForm) === -1 ||
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

    async getFormData() {
      const form = {
        title: this.data.title,
        host: this.data.host,
        contact: this.data.contact,
        numMax: this.data.numMax,
        addr: this.data.addr,
        addr1: this.data.addr1,
        addr2: this.data.addr2,
        type: this.data.type,
        actForm: this.data.actForm,
        actTimeBegin: this.data.actTimeBegin,
        actTimeEnd: this.data.actTimeEnd,
        regTimeBegin: this.data.regTimeBegin,
        regTimeEnd: this.data.regTimeEnd,
        description: this.data.description,
        coverUrl: this.data.coverUrl,
      };
      try {
        await this.checkForm(form);
      } catch (error) {
        return {
          err: error.message
        };
      }
      Log('getFormData', this.data);
      return form;
    }
  },
});