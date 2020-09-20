
var util = require('../../utils/util.js')

wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const register = db.collection('register')

Page({
  data: {

    activeNames:['1'],

    reg_number: '',
    max_number: '',
    regStu: [],
    searchValue: '',
  },

  onLoad: function (options) {
    var that = this
    let actID = options.aid
    //加载报名人数 和列表
    register.where({ 
      aid: actID
    }).get({
      success: res => {
        that.setData({
          reg_number : res.data.length
        })
        res.data.map(active => {
          console.log(active._openid)
          db.collection('user').where({
              _openid: active._openid
            })
            .get({
              success: res => {
                that.setData({
                  regStu: [...that.data.regStu, ...res.data],
                })
              },
              fail(res) {
                console.log("fail", res)
              }
            })
        })
      },
      fail(res) {
        console.log("fail", res)
      }
    }),

    //加载人数上限
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
    console.log("twet",event)
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
  onSearch(){
    console.log(1)
  },
})