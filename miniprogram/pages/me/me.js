var util = require('../../utils/util.js');
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const user = db.collection('user')
Page({

  data: {
     tabbar: 2,
     openid: '',
     role  : 0,

     actCollected:[],
     actRegistered:[],
     actReleased:[],
  },

  getOpenid: function(){
    let that = this
    wx.cloud.callFunction({
      name: 'login',
      data:{},
      success:res=>{
        let id = res.result.openid
        that.setData({
          openid : id
        })
      },
      fail:err=>{
        console.error(err)
      }
    })
  },
  onShow: function(){
    // this.getTabBar().init();
    // tabbar
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        active: 2
      })
    }


    let openid = this.data.openid
    var that = this
    //加载收藏历史

    //加载参与历史
    db.collection('register').where({        //参与活动
      openid: openid}).get({
        success:res => {
          res.data.map(active => {
            db.collection('activity').where({
              _id: active.aid
            }).orderBy('actTimeBegin', 'desc')
              .get({
                success: res => {
                  this.setData({
                    actRegistered: [...this.data.actRegistered, ...res.data],
                  })
                },
                fail(err) {
                  console.log("参与历史加载失败", err)
                }
              })
          })
        },
        fail(res) {
          console.log("fail", res)
        }
      })


    //加载发布历史
    db.collection('activity').where({           //发布活动
      _openid:openid
    }).orderBy('actTimeBegin', 'desc')
    .get({
        success(res){
          console.log("成功加载发布历史",res)
          that.setData({
            actReleased:res.data
          })
          console.log("加载后的发布历史",actReleased)
        },
        fail(err){
          console.log("fail",err)
        }
      })

  },
  onLoad: function (options) {
    this.getOpenid();
    user.where({
      _openid : this.data.openid
    }).get({
      success(res){
        console.log("查到该用户啦",res)
        this.setData({
          role: res.data[0].role
        })
      }
    })
  },
  // 转至个人信息修改页
  edit(){
    let openid = this.data.openid
    wx.navigateTo({
      url: '../../packageA/info/info?openid=' + openid,
    })
  },
  // 转至设置页
  setting(){
    let openid = this.data.openid
    wx.navigateTo({
      url: '../../packageB/setting/setting?openid=' + openid,
    })
  },
  newActivity(){
    let openid = this.data.openid
    console.log("openid",openid)
    let role = this.data.role
    console.log("角色",role)
    if(role == 1){
      wx.navigateTo({
        url: '../../packageB/newActivity/newActivity?openid=' + openid,
      })
    }
  },
  viewMore(e){
    console.log(e)
  }

})