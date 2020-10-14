var util = require('../../utils/util.js')
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const act = db.collection('activity')

const cite = {
  线上: [''],
  本部: ['', '一教', '二教', '三教', '四教', '南操', '北操', '礼堂', '奥运'],
  通州: ['', '一报', '二报', '三报', '四报', '操场', '一教', '二教', '三教', '四教']
};
const types = {
  演出: ['', '歌赛', '演讲比赛'],
  体育: ['', '篮球赛', '足球赛', '乒乓球赛'],
  学习: ['', '竞赛类', '考前模考'],
  社交: ['', '舞会', '学院联谊']
};

Page({
  data: {
    openid: '',
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
      coverUrl: "",
    },

    fileList: [],

    showAddr: false,
    showType: false,

    actDate: '',
    showActDate: false,
    regDate: '',
    showRegDate: false,

    address: [{
        values: Object.keys(cite),
        className: 'column1',
        defalutIndex: 0,
      },
      {
        values: cite['线上'],
        className: 'column2',
        defalutIndex: 2,
      }
    ],

    actType: [],
  },

  onLoad: function () {
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

  delete(event) {
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
  onCancelAddr(e) {
    this.setData({
      addr : null,
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
  onCancelType(){
    this.setData({
      type : null,
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

  checkForm(form) {
    console.log("进入校验")
    let res = true;
    const promise1 = new Promise((resolve, reject) => {
      console.log("进入校验1")
      if (form.title.length == 0 || form.title.length > 30) {
        console.log("校验1 出错")
        res = false;
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
      }
    })

    const promise2 = new Promise((resolve, reject) => {
      // 必填项检查 
      console.log("进入校验2")
      if (form.host.length == 0 || form.addr.length == 0 ||
        form.actTimeBegin.length == 0 || form.regTimeBegin.length == 0 ||
        form.description.length == 0) {
          console.log("校验2 出错")
        res = false;
        wx.showToast({
          title: '请完成所有必填项',
          icon: 'none',
          duration: 1500
        })
        setTimeout(function () {
          wx.hideToast()
        }, 2000)
      }
    })

    const promise3 = new Promise((resolve, reject) => {
      // 数据可靠性检验
      console.log("进入校验3")
      if (form.numMax != "" && !util.checkRate(form.numMax)) {
        console.log("校验3 出错")
        res = false;
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
      }
    })

    Promise.all([promise1,promise2,promise3])
    .then((value) => {
      console.log("最终校验结果",res)
      // return res;
    })

  },

  //提交键 检查数据格式并上传至云数据库
  submit: function (e) {
    console.log("点击提交",e)
 
    let aid = ''
    let form = this.data.formData
    console.log(form)
    new Promise((resolve, reject) => {
      // 数据校验
      console.log("提交promise")
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