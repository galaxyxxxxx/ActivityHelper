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
var actType = [];
var allAddr1 = [];

Page({
  data: {
    openid: '',
    formData: {
      id: "",
      title: "",
      host: "",
      numMax: "",
      regNum: "",
      contact: "",
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

    typeCollection: [],
    actDate: '',
    showActDate: false,
    regDate: '',
    showRegDate: false,

    address: [{
      values: [],
      defalutIndex: 0,
    }, {
      values: [],
      defalutIndex: 0,
    }],

    fileList: [{
      url: 'http://iph.href.lu/300x300?text=default',
      isImage: true,
      deletable: true,
    }]
  },

  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '正在加载',
    });
    this.setData({
      openid: wx.getStorageSync('openid'),
      host: wx.getStorageSync('org')
    })
    let aid = options.aid
    var form = {}
    form.id = aid
    var address = this.data.address
    var typeCollection = []
    const promise1 = new Promise((resolve, reject) => {
      // 取类别信息
      actType = wx.getStorageSync('allType')
      console.log('types', actType)
      typeCollection = actType.map(values => values.type_name)
      console.log(typeCollection);
      this.setData({
        typeCollection: typeCollection
      });
      resolve();
    });
    const promise2 = new Promise((resolve, reject) => {
      cite = wx.getStorageSync('allPlace')
      let thisAllAddr1 = Object.keys(cite);
      let pickerAddr = [{
        values: thisAllAddr1,
        defalutIndex: 0,
      }, {
        values: cite[thisAllAddr1[0]],
        defalutIndex: 0,
      }];
      allAddr1 = thisAllAddr1;
      this.setData({
        address: pickerAddr
      });
      console.log(cite);
      resolve();
    })
    const promise3 = new Promise((resolve, reject) => {
      act.where({
        _id: options.aid
      }).get().then(res => {
        console.log("act detail", res);
        form.title = res.data[0].title
        form.host = res.data[0].host
        form.numMax = res.data[0].numMax
        form.contact = res.data[0].contact
        form.addr1_index = res.data[0].addr1
        form.addr1 = Object.keys(cite)[form.addr1_index]
        form.addr2_index = res.data[0].addr2
        form.addr2 = cite[form.addr1][form.addr2_index]
        form.addr = (form.addr1 + form.addr2).toString()
        form.type_id = res.data[0].type
        form.actTimeBegin = res.data[0].actTimeBegin
        form.actTimeEnd = res.data[0].actTimeEnd
        form.regTimeBegin = res.data[0].regTimeBegin
        form.regTimeEnd = res.data[0].regTimeEnd
        form.description = res.data[0].description
        form.coverUrl = res.data[0].cover
        that.setData({
          regDate: `${form.regTimeBegin} - ${form.regTimeEnd}`,
          regArr: [form.regTimeBegin, form.regTimeEnd],
          actDate: `${form.actTimeBegin} - ${form.actTimeEnd}`,
          actArr: [form.actTimeBegin, form.actTimeEnd],
        });
        resolve();
      }).catch(err => {
        reject(err);
      })
    });
    const promise4 = new Promise((resolve, reject) => {
      db.collection('register').where({
        aid: aid
      }).get().then(
        res => {
          console.log("get regNum", res);
          let regNum = res.data.length;
          form.regNum = regNum;
          resolve()
        }
      )
    })
    Promise.all([promise1, promise2, promise3, promise4]).then(() => {
      console.log(form);
      for (let i = 0; i < actType.length; i++) {
        if (actType[i]._id === form.type_id) {
          form.type = actType[i].type_name
          this.setData({
            formData: form,
            type_index: i
          })
        }
      }
      address[0].values = Object.keys(cite)
      address[0].defaultIndex = form.addr1_index
      address[1].values = cite[form.addr1]
      address[1].defaultIndex = form.addr2_index
      this.setData({
        address: address,
        formData: form
      })
      let picList = [{
        url: form.coverUrl,
        isImage: true,
        deletable: true
      }]
      console.log(picList, form.coverUrl);

      this.setData({
        fileList: picList
      })
      wx.hideLoading();
    })
  },

  getIndexByName(arr, target) {
    console.log("getIndex", arr, target);
    for (var i = 0; i < arr.length; i++) {
      if (target === arr[i]) {
        return i
      }
    }
    return 0;
  },

  // 活动地址选择
  showPopupAddr() {
    this.setData({
      showAddr: true,
    });
  },
  onChangeAddr(e) {
    const { picker, value, index } = e.detail;
    console.log('event', e.detail);
    picker.setColumnValues(1, cite[value[0]]);
    this.setData({
      addr: value[0] + value[1]
    })
    var choice = [0, 0]
    let allAddr1 = this.data.allAddr1
    choice[0] = this.getIndexByName(allAddr1, value[0]);
    choice[1] = this.getIndexByName(cite[value[0]], value[1]);
    console.log("choice", choice);
    let form = this.data.formData
    form['addr'] = (value[0] + value[1]).toString()
    form['addr1'] = value[0];
    form['addr2'] = value[1];
    form['addr1_index'] = choice[0];
    form['addr2_index'] = choice[1];
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
    form['type'] = actType[index]._id
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
    let dontDelete = (regNum > 0)? `已有${regNum}同学报名了，请谨慎删除！\n如确认撤销，将向这${regNum}名同学推送通知` : ''
    Dialog.confirm({
      title: '真的要撤销该活动吗！😱',
      message: dontDelete,
    }).then(() => {
        let form = this.data.formData
        console.log(form);
        wx.cloud.callFunction({
          name: 'sendDelMsg',
          data: {
            aid: form.id
          },
          success: (res) => {
            db.collection('register').where({
              aid: form.id
            }).remove();
            db.collection('activity').doc(form.id).remove({
              success: function (res) {
                console.log(res.data)
              }
            })
            this.deletePic()
            wx.showToast({
              title: '已成功撤销',
              icon: 'success',
              duration: 1000
            })
            setTimeout(function () {
              wx.hideToast()
              wx.switchTab({
                url: '../../pages/me/me',
              })
            }, 1000)
          }
        })
      })
      .catch(() => {
      });
  },

  deletePic(event) {
    console.log(event)
    let imgDelIndex = 0
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

  // 表单信息校验
  checkForm(form) {
    console.log("进入校验")
    var that = this

    // 标题长度校验
    const promise1 = new Promise((resolve, reject) => {
      console.log("进入校验1")
      if (form.title.length == 0 || form.title.length > 30) {
        console.log("校验1 出错")

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
        reject(false);
      } else {
        resolve(true);
      }
    })

    // 必填项检查 
    const promise2 = new Promise((resolve, reject) => {
      console.log("进入校验2")
      if (form.addr.length == 0 ||
        form.actTimeBegin.length == 0 || form.regTimeBegin.length == 0 ||
        form.description.length == 0) {
        console.log("校验2 出错")
        wx.showToast({
          title: '请完成所有必填项',
          icon: 'none',
          duration: 1500
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
        reject();
      } else {
        resolve();
      }
    })

    // 人数数据检验（检查是否为正整数
    const promise3 = new Promise((resolve, reject) => {
      console.log("进入校验3")
      if (form.numMax != "" && !util.checkRate(form.numMax)) {
        console.log("校验3 出错")
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
        reject(false);
      } else {
        resolve(true);
      }
    })

    // UGC安全校验 - title
    const promise4 = new Promise((resolve, reject) => {
      console.log("进入校验4")
      let title = title
      wx.cloud.callFunction({
        name: "textsec",
        data: {
          text: form.title
        },
        success(res) {
          console.log("title内容安全")
          resolve(true)
        },
        fail(err) {
          wx.showToast({
            title: '活动名称存在敏感词汇',
            icon: 'none',
            duration: 1500
          })
          setTimeout(function () {
            wx.hideToast()
          }, 2000)
          that.setData({
            title: null
          })
          reject(false);
        }
      })
    })

    // UGC安全校验 - description
    const promise5 = new Promise((resolve, reject) => {
      console.log("进入校验5")
      let description = description
      wx.cloud.callFunction({
        name: "textsec",
        data: {
          text: form.description
        },
        success(res) {
          console.log("description内容安全")
          resolve(true)
        },
        fail(err) {

          wx.showToast({
            title: '概要介绍存在敏感词汇 请修改',
            icon: 'none',
            duration: 3000
          })
          setTimeout(function () {
            wx.hideToast()
          }, 2000)
          that.setData({
            description: null
          })
          reject(false)
        }
      })
    })

    // UGC安全校验 - image
    const promise6 = new Promise((resolve, reject) => {
      console.log("进入校验6")
      wx.cloud.callFunction({
        name: "imagesec",
        data: {
          img: form.coverUrl
        },
        success(res) {
          console.log("image内容安全")
          resolve(true)
        },
        fail(err) {

          wx.showToast({
            title: '图片存在敏感画面 请修改',
            icon: 'none',
            duration: 3000
          })
          setTimeout(function () {
            wx.hideToast()
          }, 2000)
          //删除图片
          wx.cloud.deleteFile({
            fileList: [form.coverUrl],
          })
          this.setData({
            fileList: []
          })
          reject(false)
        }
      })
    })
    return Promise.all([promise1, promise2, promise3, promise4, promise5, promise6])
  },

  //提交键 检查数据格式并上传至云数据库
  submit: function (e) {

    let form = this.data.formData
    let regNum = form.regNum
    let dontDelete = regNum > 0 ? '已有' + regNum + '同学报名了，请谨慎修改信息！' : ''
    Dialog.confirm({
      title: '确定要修改该活动吗！',
      message: dontDelete,
    }).then(() => {
        var aid = ''
        var that = this
        let form = this.data.formData
        new Promise((resolve, reject) => {
          let checkResult = this.checkForm(form);
          checkResult.then(() => {
            console.log('onFinal');
            wx.showLoading({
              title: '提交中......',
            });
            resolve();
          }).catch(() => {
            reject();
          })
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
                  url: '../../packageA/activityDetail/activityDetail?aid=' + form.id,
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