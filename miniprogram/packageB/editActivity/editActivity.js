var util = require('../../utils/util.js')
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const act = db.collection('activity')

const cite = {
  线上: [''],
  本部: ['', '一教', '二教', '三教', '四教', '南操', '北操'],
  通州: ['', '一报', '二报', '三报', '四报']
};
const types = {
  文娱类: [' ', '歌赛', '演讲比赛'],
  体育类: [' ', '篮球赛', '足球赛', '乒乓球赛'],
  学习类: [' ', '竞赛类', '考前模考'],
  社交类: [' ', '舞会', '学院联谊']
};

Page({
  data: {
    formData: {
      id: "",
      title: "",
      host: "",
      numMax: "",
      regNum: "",
      addr: "",
      addr1: "",
      addr2: "",
      type: "",
      type_id: "",
      actTimeBegin: "",
      actTimeEnd: "",
      regTimeBegin: "",
      regTimeEnd: "",
      description: "",
      coverUrl: "",
    },
    type_index: -1,
    addr1_index: -1,
    addr2_index: -1,
    showAddr: false,
    showType: false,

    actType: [],
    typeCollection: [],
    actDate: '',
    showActDate: false,
    regDate: '',
    showRegDate: false,
    actDate: '',
    regDate: '',

    address: [{
      values: Object.keys(cite),
      className: 'column1',
      defaultIndex: 1,
    },
    {
      values: cite['线上'],
      className: 'column2',
      defaultIndex: 2,
    }],

    actType: [],

    fileList: [{
      url: 'http://iph.href.lu/300x300?text=default',
      isImage: true,
      deletable: true,
    }],
    // Editor
    formats: {},
    readOnly: false,
    placeholder: '开始输入...',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
  },

  onLoad: function (options) {
    let aid = options.aid
    var form = this.data.formData
    form.id = aid
    var that = this;
    var typeCollection = []
    var address = this.data.address
    db.collection('type').get().then(
      res => {
        console.log('types', res.data)
        var actType = res.data
        typeCollection = actType.map(values => values.type_name)
        console.log(typeCollection);
        this.setData({
          actType: actType,
          typeCollection: typeCollection
        })
      }
    );
    act.where({
      _id: form.id
    }).get({
      success(res) {
        form.title = res.data[0].title
        form.host = res.data[0].host
        form.numMax = res.data[0].numMax
        form.regNum = res.data[0].regNum
        form.addr1 = res.data[0].addr[0] + res.data[0].addr[1]
        form.addr2 = res.data[0].addr[2] + res.data[0].addr[3]
        form.addr = res.data[0].addr
        form.type_id = res.data[0].type.trim()
        form.actTimeBegin = res.data[0].actTimeBegin
        form.actTimeEnd = res.data[0].actTimeEnd
        form.regTimeBegin = res.data[0].regTimeBegin
        form.regTimeEnd = res.data[0].regTimeEnd
        form.description = res.data[0].description
        form.coverUrl = res.data[0].cover
        that.setData({
          formData: form,
          regDate: `${form.regTimeBegin} - ${form.regTimeEnd}`,
          regArr: [new Date(form.regTimeBegin), new Date(form.regTimeEnd)],
          actDate: `${form.actTimeBegin} - ${form.actTimeEnd}`,
          actArr: [new Date(form.actTimeBegin), new Date(form.actTimeEnd)],
        })
      }
    });

    setTimeout(() => {
      console.log(form);
      db.collection('type').where({
        _id: form.type_id
      }).get().then(res => {
        console.log("timeout Res", res);
        form.type = res.data[0].type_name;
        this.setData({
          formData: form
        })
      });
      // 活动地址第二列默认选项有问题
      let addr1_index = this.getIndex(Object.keys(cite), form.addr1)
      address[0].defaultIndex = addr1_index
      address[1].values = cite[form.addr1]
      let addr2_index = this.getIndex(cite[form.addr1], form.addr2);
      address[1].defaultIndex = addr2_index
      this.setData({
        addr1_index: addr1_index,
        addr2_index: addr2_index,
        address: address,
      })
      setTimeout(() => {
        let picList = [{
          url: form.coverUrl,
          isImage: true,
          deletable: true
        }]
        console.log(form.type);
        this.setData({
          fileList: picList,
          type_index: this.getIndex(typeCollection, form.type)
        })
      }, 500)
    }, 500);
  },
  // 获取数组中某元素的下标
  getIndex(arr, target) {
    console.log("getIndex", arr, target);
    for (var i = 1; i <= arr.length; i++) {
      if (target === arr[i]) {
        return i
      }
    }
    return -1
  },

  // 活动地址选择
  showPopupAddr() {
    this.setData({
      showAddr: true,
    });
  },
  onChangeAddr(e) {
    console.log('event', e.detail.value);
    console.log(e);
    const {
      picker,
      value,
      index
    } = e.detail
    picker.setColumnValues(1, cite[value[0]]);
    let form = this.data.formData
    form['addr1'] = e.detail.value[0]
    form['addr2'] = e.detail.value[1]
    form['addr'] = e.detail.value[0] + e.detail.value[1]
    this.setData({
      formData: form
    })
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
  },
  onChangeType(e) {
    console.log('event', e.detail.value);
    console.log(e);
    this.setData({
      type: e.detail.value
    })
    let index = e.detail.index
    let form = this.data.formData
    form['type'] = this.data.actType[index]._id
    this.setData({
      formData: form
    })
  },
  onCloseType() {
    this.setData({
      showType: false,
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
  formatDate(date) {
    date = new Date(date);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = (date.getDate()).toString().padStart(2, '0');
    var time = year + "/" + month + "/" + day;
    return time;
  },
  onConfirmActDate(event) {
    const [start, end] = event.detail;
    this.setData({
      show: false,
      actDate: `${this.formatDate(start)} - ${this.formatDate(end)}`,
    });
    let form = this.data.formData
    console.log(event)
    form['actTimeBegin'] = this.formatDate(event.detail[0]);
    form['actTimeEnd'] = this.formatDate(event.detail[1])
    console.log(form['actTimeBegin'])
    this.setData({
      formData: form
    })
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
  onConfirmRegDate(event) {
    const [start, end] = event.detail;
    this.setData({
      show: false,
      regDate: `${this.formatDate(start)} - ${this.formatDate(end)}`,
    });
    let form = this.data.formData
    console.log(event)
    form['regTimeBegin'] = this.formatDate(event.detail[0])
    form['regTimeEnd'] = this.formatDate(event.detail[1])
    this.setData({
      formData: form
    })
    this.setData({
      showRegDate: false
    });
  },

  //表单信息更改
  onFormChange(e) {
    console.log(e)
    let form = this.data.formData
    form[`${e.currentTarget.dataset.field}`] = e.detail
    this.setData({
      formData: form
    })
  },

  //上传活动图片
  afterRead(event) {
    const file = event.detail.file
    this.data.fileList.unshift(file)
    var files = this.data.fileList
    this.setData({
      fileList: files
    })
    this.uploadToCloud()
  },

  // 上传图片
  uploadToCloud() {
    const { fileList } = this.data;
    if (!fileList.length) {
      wx.showToast({ title: '请选择图片', icon: 'none' });
    } else {
      console.log('Before Upload', fileList)
      var picRootPath = "activityCover/" + new Date().getTime()
      let fileName = picRootPath + `.jpg`;
      let chooseResult = fileList[0]
      var fileID = ''
      new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: fileName,
          filePath: chooseResult.path,
          success: res => {
            let form = this.data.formData
            form.coverUrl = res.fileID
            resolve(form);
          },
        });
      }).then(value => {
        this.setData({
          formData: value
        })
        return value.coverUrl
      })
    }
  },

  //删除
  delete: function (e) {
    let form = this.data.formData
    db.collection('activity').doc(form.id).remove({
      success: function (res) {
        console.log(res.data)
      }
    })
    wx.showToast({
      title: '已成功撤销该活动',
      icon: 'success',
      duration: 1500
    })
    setTimeout(function () {
      wx.hideToast()
    }, 2000)
    wx.switchTab({
      url: '../../pages/me/me',
    })
  },

  checkForm(form) {
    if (form.title.length == 0 || form.title.length > 30) {
      wx.showToast({
        title: '标题应为1-30个字符',
        icon: 'none',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
      this.setData({
        title: null
      })
    } else if (form.host.length == 0 || form.addr.length == 0 ||
      form.actTimeBegin.length == 0 || form.regTimeBegin.length == 0 ||
      form.description.length == 0) {
      wx.showToast({
        title: '请完成所有必填项',
        icon: 'none',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
      this.setData({
        title: null
      })
    } else if (!util.checkRate(form.numMax) && form.numMax.length != 0) {
      console.log('onCheckRate: "', form.numMax, '"')
      wx.showToast({
        title: '人数限制应为正整数',
        icon: 'none',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
      this.setData({
        numMax: null
      })
    } else {
      return true
    }
    return false
  },

  //提交键 检查数据格式并上传至云数据库
  submit: function (e) {
    var aid = ''
    console.log('onSubmit')
    let form = this.data.formData
    console.log(form);
    new Promise((resolve, reject) => {
      let checkResult = this.checkForm(form);
      if (checkResult) {
        console.log('onFinal');
        wx.showLoading({
          title: '提交中......',
        });
        resolve();
      } else {
        reject();
      }
    }).then(() => {
      new Promise((resolve1, reject1) => {
        console.log("in Promise");
        form.coverUrl = this.data.formData.coverUrl
        console.log(form.coverUrl);
        db.collection('activity').doc(form.id).set({
          data: {
            title: form.title,
            host: form.host,
            numMax: form.numMax,
            regNum: form.regNum,
            addr: form.addr,
            type: form.type,
            actTimeBegin: form.actTimeBegin,
            actTimeEnd: form.actTimeEnd,
            regTimeBegin: form.regTimeBegin,
            regTimeEnd: form.regTimeEnd,
            description: form.description,
            cover: form.coverUrl,
          },
          success: function (res) {
            console.log("finish add: ", res)
            resolve1();
          }
        })
      }).then(() => {
        wx.hideLoading();
        wx.navigateTo({
          url: `../../packageA/activityDetail/activityDetail?aid=${form.id}`,
        });
      })
    })
  },
})