let util = require('../../utils/util.js');
wx.cloud.init({env: 'x1-vgiba'})
const db = wx.cloud.database({ env: 'x1-vgiba' })
const act = db.collection('activity')
const collect = db.collection('collect')
const _ = db.command

Page({
  data: {
    openid: "",
    collectIcon: 'star-o', // 收藏按钮的默认设置
    collectColor: '#80a0c0',

    //今天的时间；需写一个函数，先调取当天日期，再转换格式进行setData，最后渲染到前端页面顶端的时间栏
    year: 2020,
    month: 'Aug',
    day: 3,

    //用于测试的静态数据
    actingTest: [{
      id: 0,
      _id: 'b58263a25f2829950054151f2d77a647',
      title: '全国大学生数学建模竞赛(国内)',
      host: '数理学院',
      lable: ['学习', '竞赛'],
      addr: '本部 四教',
      regNum: 233,
      actTimeEnd: '2020/7/30',
      collect: 0
    }, {
      id: 1,
      _id: 'b58263a25f282c3d005445dc2cfd16b8',
      title: '毕业季捐书活动',
      host: '校学生会',
      lable: ['公益'],
      addr: '线上',
      regNum: 53,
      actTimeEnd: '2020/7/30',
      collect: 0
    }], //活动集 | 正在进行的


    acting: [],

    //以下为测试的静态数据
    actMain: {
      id: 0,
      aid: '0d06a2fd5f282af60049935b10c59212',
      title: '这是一行测试长度最大值的数据',
      host: '新媒体',
      lable: ['文艺', '社交', '竞赛'],
      addr: '本部南操',
      regNum: 233,
      actTimeEnd: '2020/9/30',
      collect: 0
    },

  },

  onLoad: function (options) {
  },

  
  onShow: function () {
    // tabbar
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 0
      })
    }

    let openid = this.data.openid
    let today = this.formatDate(new Date())

    act.where({
      actTimeEnd : _.gt(today)
    })
    .get()
    .then(
      res => {
        this.setData({
          acting : res.data
        })
      },
    )
    .catch(console.error)
  },

  //点击收藏按钮的事件
  collect(e) {
    console.log(e)
    let that = this
    let acting = that.data.acting
    // 先获取活动索引(是数组的index，而非_id噢；因为点击事件event只能捕捉到这是acting数组的第几个，所以通过index去数组里找该活动的_id信息) 
    let index = e.currentTarget.id
    let patten = 'acting[index].patten'
    let color = 'acting[index].color'
    if (patten != 'star') { //如果未收藏，需要改为已收藏
      this.setData({ //先更新前端能看到的样式
        patten: 'star',
        color: 'goldenrod',
      })
      collect.add({
        data: {
          _id: acting[index]._id,
          uid: uid
        }
      })
    } else { //如果已收藏，需要改为未收藏
      this.setData({
        patten: 'star-o',
        color: '#80a0c0',
      })
      collect.where({ //再更新数据库的收藏表
        _id: acting[id].id,
        uid: uid
      }).get({ //先查到该收藏记录的_id 再删除
        success(res) {
          console.log(res)
          let id = res.data[0]._id
          collect.doc(id).remove({
            success(res) {
              console.log('已成功取消该收藏');
              wx.showToast({
                title: '已取消收藏',
              })
            }
          })
        }
      })
    }
  },

  //点击查看更多(MORE)，跳转至活动详情页
  viewMore1(e) {
    console.log(e)
    let that = this
    let aid = that.data.actMain.aid
    console.log("当前点击的活动id为", aid)
    wx.navigateTo({
      url: '../../packageA/activityDetail/activityDetail?aid=' + aid,
    })
  },
  viewMore(e) {
    console.log(e)
    let index = e.currentTarget.id
    console.log(this.data.acting)
    console.log("e",e)
    let _id = this.data.acting[index]._id
    
    console.log("当前点击的活动id为", _id)
    wx.navigateTo({
      url: '../../packageA/activityDetail/activityDetail?aid=' + _id,
    })
  },
  // 点击筛选按钮后 弹出模态框 进行条件筛选
  select(e){

  },
  formatDate(date) {
    date = new Date(date);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = (date.getDate()).toString().padStart(2, '0');
    let time = year + "/" + month + "/" + day;
    return time;
  },
  linkToMe() {
    wx.navigateTo({
      url: '../../packageA/info/info',
    })
  }
})