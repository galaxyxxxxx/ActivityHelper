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
  文娱类: ['', '歌赛', '演讲比赛'],
  体育类: ['', '篮球赛', '足球赛', '乒乓球赛'],
  学习类: ['', '竞赛类', '考前模考'],
  社交类: ['', '舞会', '学院联谊']
};


Page({
  data: {
    formData: {
      title: "",
      host: "",
      numMax: "",
      addr: "",
      type: "",
      actTimeBegin: "",
      actTimeEnd: "",
      regTimeBegin: "",
      regTimeEnd: "",
      description: "",
      cover: "",
    },

    fileList: [{
      url: '',
      name: 'cover'
    }],

    showAddr: false,
    showType: false,

    actDate: '',
    showActDate: false,
    regDate: '',
    showRegDate: false,

    address: [{
        values: Object.keys(cite),
        className: 'column1',
      },
      {
        values: cite['线上'],
        className: 'column2',
        defalutIndex: 2,
      }
    ],

    actType: [{
        values: Object.keys(types),
        className: 'column1',
      },
      {
        values: types['文娱类'],
        className: 'column2',
        defalutIndex: 2,
      }
    ],


  },

  //上传活动图片  需要更改
  afterRead(event) {

    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    const {
      fileList = []
    } = this.data;
    fileList.push({
      ...file,
      url: res.data
    });
    this.setData({
      fileList
    });

    //更改form表单里的cover为图片url
    let form = this.data.formData
    form['cover'] = event.detail.file.path
    this.setData({
      formData: form
    });

  },

  // 活动地址选择
  showPopupAddr() {
    this.setData({
      showAddr: true,
    });
  },
  onChangeAddr(e) {
    const {
      picker,
      value,
      index
    } = e.detail
    picker.setColumnValues(1, cite[value[0]]);
    console.log(e);
    this.setData({
      addr: e.detail.value[0] + e.detail.value[1]
    })
    let form = this.data.formData
    form['addr'] = (e.detail.value[0] + e.detail.value[1]).toString()
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
    const {
      picker,
      value,
      index
    } = e.detail
    picker.setColumnValues(1, types[value[0]]);
    console.log(e);
    this.setData({
      type: e.detail.value[0] + e.detail.value[1]
    })
    let form = this.data.formData
    form['type'] = e.detail.value[0] + e.detail.value[1]
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
    return `${date.getMonth() + 1}/${date.getDate()}`;
  },
  onConfirmActDate(event) {
    const [start, end] = event.detail;
    this.setData({
      show: false,
      actDate: `${this.formatDate(start)} - ${this.formatDate(end)}`,
    });
    let form = this.data.formData
    form['actTimeBegin'] = this.formatDate(event.detail[0])
    form['actTimeEnd'] = this.formatDate(event.detail[1])
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
  formatDate(date) {
    date = new Date(date);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = (date.getDate()).toString().padStart(2, '0');
    var time = year + "/" + month + "/" + day;
    return time;
  },
  onConfirmRegDate(event) {
    const [start, end] = event.detail;
    this.setData({
      show: false,
      regDate: `${this.formatDate(start)} - ${this.formatDate(end)}`,
    });
    let form = this.data.formData
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

  //提交键 检查数据格式并上传至云数据库
  submit: function (e) {
    let form = this.data.formData
    form[`${e.currentTarget.dataset.field}`] = e.detail
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
    } else if (form.host.length == 0 || form.addr.length == 0 || form.actTimeBegin.length == 0 || form.regTimeBegin.length == 0 || form.description.length == 0) {
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
    } else if (!util.checkRate(form.numMax)) {
      wx.showToast({
        title: '若有人数限制应为正整数',
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
      db.collection('activity').add({
        data: {
          title: form.title,
          host: form.host,
          numMax: form.numMax,
          addr: form.addr,
          type: form.type,
          actTimeBegin: form.actTimeBegin,
          actTimeEnd: form.actTimeEnd,
          regTimeBegin: form.regTimeBegin,
          regTimeEnd: form.regTimeEnd,
          description: form.description,
          cover: form.cover,
        },
        success: function (res) {
          console.log(res)
        }
      })
      wx.showToast({
        title: '已添加成功',
        icon: 'success',
        duration: 1500
      })
      setTimeout(function () {
        wx.hideToast()
      }, 2000)
      wx.navigateTo({
        url: '/miniprogram/packageB/activityDetail/activityDetail?aid={{}}',
      })
    }

  },
})