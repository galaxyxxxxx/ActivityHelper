var util = require('../../utils/util.js')
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})

var cite = {};

Page({
  data: {
    openid: '',
    contact:'',
    formData: {
      title: "",
      host: "",
      contact:'',
      numMax: "",
      addr: "",
      addr1: "",
      addr2: "",
      type: "",
      actTimeBegin: "",
      actTimeEnd: "",
      regTimeBegin: "",
      regTimeEnd: "",
      description: "",
      coverUrl: "",
    },

    fileList: [],

    showAddr: false,
    showType: false,

    actDate: '',
    showActDate: false,
    regDate: '',
    showRegDate: false,
    type: '',

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
  },

  onLoad: function () {
    wx.showLoading({
      title: '正在加载',
    });
    let contact = this.data.formData.contact
    this.setData({
      openid: wx.getStorageSync('openid'),
      host: wx.getStorageSync('org'),
      contact : wx.getStorageSync('tel')
    })

    let form = this.data.formData
    form['contact'] = wx.getStorageSync('tel')
    this.setData({
      formData: form
    })
    // 取类别信息
    db.collection('type').get().then(
      res => {
        console.log('types', res.data)
        var typeCollection = res.data
        typeCollection = typeCollection.map(values => values.type_name)
        console.log(typeCollection);
        this.setData({
          actType: res.data,
          typeCollection: typeCollection
        })
      }
    )
    // 取地址信息
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

  // 删除图片
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
      let form = this.data.formData
      form['addr'] = (choose[0] + choose[1]).toString()
      form['addr1'] = choose[0];
      form['addr2'] = choose[1];
      form['addr1_index'] = 0;
      form['addr2_index'] = 0;
      this.setData({
        formData: form,
        addr: choose[0] + choose[1]
      })
    }
  },
  onChangeAddr(e) {
    const {
      picker,
      value,
      index
    } = e.detail
    console.log("On change", e);
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
    if (this.data.type === "") {
      let allActType = this.data.actType;
      let form = this.data.formData
      setTimeout(() => {
        form['type'] = allActType[0]._id;
        this.setData({
          formData: form,
          type: allActType[0].type_name
        })
      }, 300)
    }
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
      if (form.addr.length == 0 || form.contact.length == 0 ||
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
    const promise31 = new Promise((resolve, reject) => {
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

        // 联系方式数据检验（检查是否为手机号或邮箱
        const promise32 = new Promise((resolve, reject) => {
          console.log("进入校验32")
          if (util.isTel(form.contact) || util.isEmail(form.contact)) {
            console.log("校验3 出错")
            wx.showToast({
              title: '联系方式格式不正确',
              icon: 'none',
              duration: 1500
            })
            setTimeout(function () {
              wx.hideToast()
            }, 2000)
            this.setData({
              contact: null
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
    console.log("点击提交", e)
    let aid = ''
    let form = this.data.formData
    form.host = this.data.host
    console.log(form)
    var that = this;
    new Promise((resolve, reject) => {
      // 数据校验
      console.log("提交promise")
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
        form.coverUrl = this.data.formData.coverUrl
        let openid = this.data.openid
        console.log(form.coverUrl);
        db.collection('activity').add({
          data: {
            openid: openid,
            title: form.title,
            host: form.host,
            numMax: form.numMax,
            regNum: 0,
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
          },
          success: function (res) {
            console.log("finish add: ", res)
            aid = res._id
            resolve1()
          }
        })
      }).then(() => {
        wx.hideLoading();
        wx.showToast({
          title: '已成功发布',
          icon: 'success',
          duration: 1000
        })
        wx.redirectTo({
          url: `../../packageA/activityDetail/activityDetail?aid=${aid}`,
        });

      })
    })
  },
})