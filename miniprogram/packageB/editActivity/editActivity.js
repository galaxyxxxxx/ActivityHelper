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
      type: "",
      actTimeBegin: "",
      actTimeEnd: "",
      regTimeBegin: "",
      regTimeEnd: "",
      description: "",
      cover: "",
    },

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

    fileList: [{
      url: 'http://iph.href.lu/60x60?text=default',
      name: '图片2',
      isImage: true,
      deletable: true,
    }]
  },

  onLoad: function (options) {
    let form = this.data.formData
    this.setData({
      'formData.id' : options.act_id || 'a7d38b365f07298300029c667b921d19'
    })
    
    var that = this;
    act.where({
      _id: form['id']
    }).get({
      success(res) {
        that.setData({
          'formData.title': res.data[0].title,
          'formData.host': res.data[0].host,
          'formData.numMax': res.data[0].numMax,
          'formData.addr': res.data[0].addr,
          'formData.type': res.data[0].type,
          'formData.actTimeBegin': res.data[0].actTimeBegin,
          'formData.actTimeEnd': res.data[0].actTimeEnd,
          'formData.regTimeBegin': res.data[0].regTimeBegin,
          'formData.regTimeEnd': res.data[0].regTimeEnd,
          'formData.description': res.data[0].description,
          'formData.cover': res.data[0].cover,
        })
      }
    })
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
    const {
      picker,
      value,
      index
    } = e.detail
    picker.setColumnValues(1, types[value[0]]);
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