import {
  TagLog
} from '../../utils/taggedLog';
const util = require('../../utils/util');
const Log = (...message) => {
  TagLog('components/activity-editor', ...message);
};

Component({
  properties: {
    host: String, // 举办部门
    contact: String, // 联系方式
  },

  data: {
    // 表单数据
    title: '', // 活动名称
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
    clockinTimeBegin: ['00:00'], // 打卡开始时间(时间段)
    clockinTimeEnd: ['23:59'], // 打卡结束时间(时间段)

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

    // 临时变量
    tmpDateBegin: new Date(), // 用于选择打卡时间段时设置选择器的起始时间
    tmpDateEnd: new Date(), // 用于选择打卡时间段时设置选择器的结束时间
    tmpIndex: 0, // 用于记录是第几个时间段触发事件使打卡时间选择器显示(showTimePicker = true)
    oldCampus: '', // 上次选择的校区地址，用于在onChangeAddr中分辨是否修改了校区地址
    setToBegin: true, // 用于标识从选择器中获取的事件赋给开始时间还是结束时间

    // 控制变量
    showAddr: false, // 显示活动地址选择器
    showType: false, // 显示活动类别选择器
    showActForm: false, // 显示活动形式选择器
    showActDate: false, // 显示活动起止时间选择器
    showRegDate: false, // 显示报名起止时间选择器
    showTimePicker: false // 显示打卡时间段选择器
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
    }
  },
  methods: {
    setFormData(form) {
      this.setData({
        title: form.title, // 活动名称
        host: form.host, // 举办部门
        contact: form.contact, // 联系方式
        regNum: form.regNum, // 报名人数
        numMax: form.numMax, // 人数上限
        addr: form.addr, // 活动地址
        addr1: form.addr1, // 活动地址下标（校区）
        addr2: form.addr2, // 活动地址下标（具体地址）
        type: form.type, // 活动类别id
        actForm: form.actForm, // 活动形式
        actTimeBegin: form.actTimeBegin, // 活动开始时间
        actTimeEnd: form.actTimeEnd, // 活动结束时间
        regTimeBegin: form.regTimeBegin, // 报名开始时间（仅当活动类型为报名时有效）
        regTimeEnd: form.regTimeEnd, // 报名结束时间（仅当活动类型为报名时有效）
        clockinTimeBegin: form.clockinTimeBegin, // 打卡时间段
        clockinTimeEnd: form.clockinTimeEnd, // 打卡时间段
        description: form.description, // 活动概要介绍
        coverUrl: form.coverUrl, // 活动封面链接
      });
      const typeIds = this.data.allTypes.map(t => t._id);
      const typeIndex = typeIds.indexOf(this.data.type);
      this.setData({
        actDateStr: `${form.actTimeBegin} - ${form.actTimeEnd}`,
        typeName: typeIndex === -1 ? '' : this.data.allTypeNames[typeIndex],
        imageList: [{
          url: form.coverUrl,
          isImage: true,
          deletable: true
        }]
      });
      if (this.data.regTimeBegin === '') {
        return;
      }
      this.setData({
        regDateStr: `${form.regTimeBegin} - ${form.regTimeEnd}`,
      });
    },

    checkImageSize(e) {
      const {
        file,
        callback
      } = e.detail;
      Log(e);
      const lessThan2mb = file.size < 2048 * 1024;
      // 直接使用max-size属性不会有任何提示，所以使用before-read事件
      if (!lessThan2mb) {
        wx.showToast({
          title: '图片过大，请将大小限制在2mb',
          icon: 'error',
          duration: 3000
        });
      }
      callback(this.isImage && lessThan2mb);
    },

    uploadImage(e) {
      console.log('test')
      const {file} = e.detail;
      this.setData({
        imageList: file
      });

      wx.cloud.uploadFile({
        cloudPath: 'activityCover/' + new Date().getTime() + '.jpg',
        filePath: file.path
      });
      // let upload = true;
      // if(upload == fail){
      //   // fail to upload the img
      //   wx.showToast({
      //     title: '图片上传失败',
      //     icon: 'none',
      //     duration: 3000
      //   });
      //   this.setData({
      //     imageList: []
      //   });
      // }
      
    },

    deleteImage() {
      Log('delete image', this.data.imageList);
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
    onCloseClockinTimePicker() {
      this.setData({
        showTimePicker: false
      });
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
      let detailed = value[1];
      if (value[0] !== this.data.oldCampus) {
        picker.setColumnValues(1, this.data.allDetailedAddress[value[0]]);
        this.setData({
          oldCampus: value[0]
        });
        detailed = '';
      }

      this.setData({
        addr: value[0] + detailed,
        addr1: this.data.allCampusAddress.indexOf(value[0]),
        addr2: this.data.allDetailedAddress[value[0]].indexOf(detailed)
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
    IncreaseClockinTimeRegion() {
      const beg = this.data.clockinTimeBegin;
      const end = this.data.clockinTimeEnd;
      const lastEndTime = end[end.length - 1];
      Log('increase region', beg, end, lastEndTime);
      if (lastEndTime === '23:59') {
        wx.showToast({
          title: '时间段已达到今日上限',
          icon: 'none',
          duration: 3000
        });

        return;
      }
      const timeInfo = lastEndTime.split(':').map(t => parseInt(t));
      const newBeginTime = new Date();
      newBeginTime.setHours(timeInfo[0], timeInfo[1] + 1);
      Log('new time', timeInfo, newBeginTime);
      beg.push(util.formatNumber(newBeginTime.getHours()) + ':' + util.formatNumber(newBeginTime.getMinutes()));
      end.push('23:59');
      this.setData({
        clockinTimeBegin: beg,
        clockinTimeEnd: end
      });
    },
    DecreaseClockinTimeRegion() {
      const beg = this.data.clockinTimeBegin;
      const end = this.data.clockinTimeEnd;
      beg.pop();
      end.pop();
      this.setData({
        clockinTimeBegin: beg,
        clockinTimeEnd: end
      });
    },
    onClockinRegionChanged(e) {
      Log(e);
    },
    pickBeginTime(e) {
      Log('pickBeginTime', e);
      const index = e.target.dataset.index;
      const pickerBegin = this.data.clockinTimeEnd[index - 1] || '00:00';
      const pickerEnd = this.data.clockinTimeEnd[index];
      const lowBound = pickerBegin.split(':').map(t => parseInt(t));
      const highBound = pickerEnd.split(':').map(t => parseInt(t));
      const beginDate = new Date();
      const endDate = new Date();
      beginDate.setHours(lowBound[0], lowBound[1]);
      endDate.setHours(highBound[0], highBound[1]);
      Log('set picker limit', pickerBegin, pickerEnd);
      this.setData({
        showTimePicker: true,
        tmpIndex: index,
        setToBegin: true,
        tmpDateBegin: beginDate,
        tmpDateEnd: endDate
      });

    },
    pickEndTime(e) {
      Log('pickEndTime', e);
      const index = e.target.dataset.index;
      const pickerBegin = this.data.clockinTimeBegin[index];
      const pickerEnd = this.data.clockinTimeBegin[index + 1] || '23:59';
      const lowBound = pickerBegin.split(':').map(t => parseInt(t));
      const highBound = pickerEnd.split(':').map(t => parseInt(t));
      const beginDate = new Date();
      const endDate = new Date();
      beginDate.setHours(lowBound[0], lowBound[1]);
      endDate.setHours(highBound[0], highBound[1]);
      Log('set picker limit', pickerBegin, pickerEnd);
      this.setData({
        showTimePicker: true,
        tmpIndex: index,
        setToBegin: false,
        tmpDateBegin: beginDate,
        tmpDateEnd: endDate
      });

    },
    onConfirmClockinTimePicker(e) {
      Log('confirm', e);
      const confirmedDate = new Date();
      const value = e.detail;
      const timeInfos = value.split(':').map(t => parseInt(t));
      confirmedDate.setHours(timeInfos[0], timeInfos[1]);
      if (confirmedDate < this.data.tmpDateBegin) {
        const time = `${util.formatNumber(this.data.tmpDateBegin.getHours())}:${util.formatNumber(this.data.tmpDateBegin.getMinutes())}`;
        wx.showToast({
          title: `您所选定的时间应大于${time}`,
          icon: 'none',
          duration: 3000
        });
        return;
      }
      if (this.data.tmpDateEnd < confirmedDate) {
        const time = `${util.formatNumber(this.data.tmpDateEnd.getHours())}:${util.formatNumber(this.data.tmpDateEnd.getMinutes())}`;
        wx.showToast({
          title: `您所选定的时间应小于${time}`,
          icon: 'none',
          duration: 3000
        });
        return;
      }
      const dataKey = this.data.setToBegin ? 'clockinTimeBegin' : 'clockinTimeEnd';
      const array = this.data[dataKey];
      array[this.data.tmpIndex] = value;
      const toSet = {
        showTimePicker: false
      };
      toSet[dataKey] = array;
      this.setData(toSet);
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

    async getFormData(secureCheck) {
      const form = {
        title: this.data.title,
        host: this.data.host,
        contact: this.data.contact,
        numMax: this.data.numMax,
        addr: this.data.addr,
        addr1: this.data.addr1,
        addr2: this.data.addr2,
        addr1_index: this.data.addr1, // 有些云函数的参数是addr1_index(updateActivity)
        addr2_index: this.data.addr2,
        type: this.data.type,
        actForm: this.data.actForm,
        actTimeBegin: this.data.actTimeBegin,
        actTimeEnd: this.data.actTimeEnd,
        regTimeBegin: this.data.regTimeBegin,
        regTimeEnd: this.data.regTimeEnd,
        clockinTimeBegin: this.data.clockinTimeBegin,
        clockinTimeEnd: this.data.clockinTimeEnd,
        description: this.data.description,
        coverUrl: this.data.coverUrl,
      };
      if (secureCheck) {
        try {
          await this.checkForm(form);
        } catch (error) {
          return {
            err: error.message
          };
        }
      }
      Log('getFormData', this.data);
      return form;
    }
  },
});