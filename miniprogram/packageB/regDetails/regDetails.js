var util = require('../../utils/util.js')
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const register = db.collection('register')

Page({
  data: {
    aid: '',
    activeNames: ['1'],
    reg_number: '',
    max_number: '',
    regStu: [],
    searchValue: '',
    tempFileURL: '',
    fileUrl: ''
  },

  onLoad: function (options) {
    var that = this
    let actID = options.aid
    this.setData({
      aid: actID
    })
    //加载报名人数 和列表
    register.where({
      aid: actID
    }).get({
      success: res => {
        that.setData({
          reg_number: res.data.length
        })
        res.data.map(active => {
          console.log(active._openid)
          console.log(active.regTime);

          db.collection('user').where({
            _openid: active._openid
          }).get({
            success: res1 => {
              let thisUser = res1.data[0];
              thisUser.regTime = active.regTime;
              console.log(thisUser);
              that.setData({
                regStu: [...that.data.regStu, thisUser],
              })
            },
            fail: res => {
              console.log("fail", res)
            }
          })
        })
      },
      fail: res => {
        console.log("fail", res)
      }
    })
    // 加载人数上限
    db.collection('activity').where({
      _id: actID
    }).get({
      success: res => {
        this.setData({
          max_number: res.data[0].numMax
        })
      },
      fail(res) {
        console.log("fail", res)
      }
    })
  },
  onChangeUser(event) {
    console.log("twet", event)
    this.setData({
      activeNames: event.detail,
    });
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  onOpen(event) {
    Toast(`展开: ${event.detail}`);
  },
  onClose(event) {
    Toast(`关闭: ${event.detail}`);
  },
  onSearch() {
    console.log(1)
  },
  onClickGenExcel() {
    var that = this
    Dialog.confirm({
      title: '生成Excel文件链接',
      message: '小程序暂不支持打开外部链接，可点击复制链接后在浏览器中粘贴查看。',
      confirmButtonText: "复制链接"
    }).then(() => {
      // on confirm
      wx.showLoading({
        title: '正在导出...',
      });
      console.log(this.data.regStu);
      that.saveExcel();
    }).catch(() => {
      // on cancel
    });
  },
  saveExcel() {
    let that = this
    wx.cloud.callFunction({
      name: "genExcelFile",
      data: {
        aid: that.data.aid,
        dataList: that.data.regStu
      },
      success(res) {
        console.log("保存成功", res)
        that.getFileUrl(res.result.fileID);
      },
      fail(res) {
        console.log("保存失败", res)
      }
    })
  },
  getFileUrl(fileID) {
    let that = this;
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        // get temp file URL
        console.log("文件下载链接", res.fileList[0].tempFileURL)
        that.setData({
          fileUrl: res.fileList[0].tempFileURL
        });
        that.copyFileUrl();
      },
      fail: err => {
        // handle error
      }
    })
  },
  copyFileUrl() {
    let that = this
    wx.setClipboardData({
      data: that.data.fileUrl,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log("复制成功", res.data) // data
          }
        });
        wx.hideLoading();
        wx.showToast({
          title: '已复制下载链接',
          icon: 'success',
          duration: 2000
        });
      }
    })
  },
})