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
      addr: "",
      type_name: "",
      type_id: "",
      actTimeBegin: "",
      actTimeEnd: "",
      regTimeBegin: "",
      regTimeEnd: "",
      description: "",
      coverUrl: "",
    },
    type_index: -1,
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
      },
      {
        values: cite['线上'],
        className: 'column2',
        defalutIndex: 2,
      }
    ],

    actType: [],

    fileList: [{
      url: 'http://iph.href.lu/60x60?text=default',
      isImage: true,
      deletable: true,
    }]
  },

  onLoad: function (options) {
    let aid = options.aid
    var form = this.data.formData
    form.id = aid
    var that = this;
    var typeCollection = []
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
          actArr: [new Date(form.actTimeBegin), new Date(form.actTimeEnd)]
        })
      }
    });
    setTimeout(() => {
      console.log(form);
      db.collection('type').where({
        _id: form.type_id
      }).get().then(res => {
        console.log("timeout Res", res);
        form.type_name = res.data[0].type_name;
        this.setData({
          formData: form
        })
      });
      let picList = [{
        url: form.coverUrl,
        isImage: true, 
        deletable: true
      }]
      this.setData({
        fileList: picList,
        type_index: this.getIndex(typeCollection, form.type_name)
      })
    }, 500);
  },
  // default的值还没有成功
  getIndex(arr, target) {
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
    const {
      picker,
      value,
      index
    } = e.detail
    picker.setColumnValues(1, cite[value[0]]);
    this.setData({
      addr: e.detail.value[0] + e.detail.value[1]
    })
    let form = this.data.formData
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

  //上传活动图片  需要更改  
  afterRead(event) {
    console.log(event);
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    wx.uploadFile({
      cloudPath: 'cloud://cover_test1',
      filePath: file.path,
      name: '',
      success(res) {
        // 上传完成需要更新 fileList
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
      },
    });
  },

  //删除
  delete: function(e){
    let form = this.data.formData
    db.collection('activity').doc(form['id']).remove({
      success: function(res) {
        console.log(res.data)
      }
    })
    wx.showToast({
      title: '已成功删除',
      icon: 'success',
      duration: 1500
    })
    setTimeout(function () {
      wx.hideToast()
    }, 2000)
    wx.switchTab({
      url: '../me/me',
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
    console.log(this.data.formData)
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
    } else if (form.host.length == 0 || form.addr.length == 0 || form.type.length == 0 || form.actTimeBegin.length == 0 || form.regTimeBegin.length == 0 || form.description.length == 0) {
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
      db.collection('activity').doc(form['id']).set({
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
          cover: '',
        },
        success: function (res) {
          console.log(form)
          wx.showToast({
            title: '已修改成功',
            icon: 'success',
            duration: 1500
          })
          setTimeout(function () {
            wx.hideToast()
          }, 2000)
          wx.navigateTo({
            url: '../activityDetail/activityDetail',
          })
        }
      })
      
    }
  },
})