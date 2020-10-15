var util = require('../../utils/util.js')
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const act = db.collection('activity')

var cite = {};

Page({
  data: {
    openid: '',
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
    showAddr: false,
    showType: false,

    actType: [],
    typeCollection: [],
    actDate: '',
    showActDate: false,
    regDate: '',
    showRegDate: false,

    address: [{
        values: Object.keys(cite),
        className: 'column1',
        defaultIndex: 1,
      },
      {
        values: cite['线上'],
        className: 'column2',
        defaultIndex: 2,
      }
    ],

    actType: [],

    fileList: [{
      url: 'http://iph.href.lu/300x300?text=default',
      isImage: true,
      deletable: true,
    }]
  },

  onLoad: function (options) {
    var that = this;
    wx.cloud.callFunction({
      name: 'login',
      success: function (res) {
        console.log(res);
        that.setData({
          openid: res.result.openid
        })
      }
    })
    let aid = options.aid
    var form = this.data.formData
    form.id = aid
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
    db.collection('place').get().then(
      res => {
        let addr = res.data;
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
        console.log(addr);
        for (let i = 0; i < addr.length; i++) {
          cite[addr[i].addr1] = addr[i].addr2;
        }
        console.log(cite);
        setTimeout(() => {
          wx.hideLoading();
        }, 500);
      })
    act.where({
      _id: form.id
    }).get({
      success(res) {
        form.title = res.data[0].title
        form.host = res.data[0].host
        form.numMax = res.data[0].numMax
        form.regNum = res.data[0].regNum
        form.addr1_index = res.data[0].addr1_index
        form.addr1 = Object.keys(cite)[form.addr1_index]
        form.addr2_index = res.data[0].addr2_index
        form.addr2 = cite[form.addr1_index][form.addr2_index]
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
      address[0].defaultIndex = form.addr1_index
      address[1].values = cite[form.addr1]
      address[1].defaultIndex = form.addr2_index
      this.setData({
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
      }, 1000)
    }, 1000);
  },

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
  onCancelAddr(e) {
    this.setData({
      addr: null,
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
    const {
      fileList
    } = this.data;
    if (!fileList.length) {
      wx.showToast({
        title: '请选择图片',
        icon: 'none'
      });
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
    let regNum = form.regNum
    let dontDelete = regNum > 0 ? '已有' + regNum + '同学报名了，请谨慎删除！\n如确认撤销，将向这' + regNum + '名同学推送通知' : ''
    Dialog.confirm({
        title: '真的要撤销该活动吗！😱',
        message: dontDelete,
      })
      .then(() => {
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
      })
      .catch(() => {

      });
  },

  deletePic(event) {
    console.log(event)
    let imgDelIndex = event.detail.index
    let fileList = this.data.fileList
    let form = this.data.formData
    wx.cloud.deleteFile({
      fileList: [form.coverUrl],
    })
    fileList.splice(imgDelIndex, 1)
    console.log('删除图片的', fileList)
    this.setData({
      fileList: []
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

    let form = this.data.formData
    let regNum = form.regNum
    let dontDelete = regNum > 0 ? '已有' + regNum + '同学报名了，请谨慎修改信息！\n如每次修改，将向这' + regNum + '名同学推送通知' : ''
    Dialog.confirm({
        title: '确定要修改该活动吗！',
        message: dontDelete,
      })
      .then(() => {

        var aid = ''
        var that = this
        let form = this.data.formData

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
            form.coverUrl = that.data.formData.coverUrl
            console.log(form.coverUrl);
            wx.cloud.callFunction({
              name: 'updateActivity',
              data: {
                form: form
              },
              success: function (res) {
                console.log("finish add: ", res)
                resolve1();
              },
              fail: function (err) {
                console.error(err);
                reject1("fail update");
              }
            })
          }).then(() => {
            wx.hideLoading();
            wx.showToast({
              title: '成功修改',
              icon: 'success',
              duration: 1000
            })
            wx.hideToast({
              success: (res) => {
                wx.redirectTo({
                  url: '../../packageA/activityDetail/activityDetail?aid='+form.id,
                });
              },
            })
          })
        })

      })
      .catch(() => {

      });


  },
})