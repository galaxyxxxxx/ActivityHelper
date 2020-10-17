// packageA/list/list.js
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const act = db.collection('activity')
const type = db.collection('type')
const app = getApp()
const collect = db.collection('collect')
const _ = db.command

Page({

  data: {
    openid:'',
    type_id: '',
    type_name: '',
    acting: [],
    // 标识当前page
    pageId: 0,
  },

  onLoad: function (options) {
    let that = this;
    this.setData({
      openid: wx.getStorageSync('openid')
    })
    let today = this.formatDate(new Date())

    let type_id = options.type
    this.setData({
      type_id: type_id
    })

    type.where({
      _id: type_id
    }).get().then(res => {
      console.log(res);
      this.setData({
        type_name: res.data[0].type_name
      })
    })

    // 加载列表
    setTimeout(() => {
      act.where({
        actTimeEnd: _.gte(today), //查找尚未到截止日期的活动
        type: this.data.type_id
      })
        .orderBy('actTimeEnd', 'desc')
        .limit(5)
        .get()
        .then(
          res => {
            res.data.forEach(function (currentValue, index, arr) { // 对获取到的活动集一一添加是否收藏的属性
              // let that = this
              collect.where({
                _openid: that.data.openid,
                aid: currentValue._id
              })
                .get()
                .then(
                  res2 => {
                    currentValue.isCollected = res2.data.length == 1 ? true : false
                  },
                )

              db.collection('register').where({
                aid: currentValue._id
              })
                .get()
                .then(
                  res3 => {
                    currentValue.regNum = res3.data.length
                  },
                )

            })
            setTimeout(() => {
              this.setData({
                acting: res.data //获取到活动的raw数据 直接赋值给acting
              })
            }, 50);
          }
        )
    }, 100);


  },
  //点击收藏按钮的事件
  collect(e) {
    if (e.mark.starMark === "star") {
      console.log("已点击收藏按钮", e)
      
      let that = this
      var aid = e.currentTarget.dataset.collectid
      var index = e.currentTarget.dataset.index
      let openid = that.data.openid
      console.log("Collecting",aid,index)
      collect.where({
        _openid: that.data.openid,
        aid: aid
      }).get({
        success: function (res) {
          console.log("收藏数据库查找成功", res)
          if (res.data.length == 0) { //如果未收藏，需要改为已收藏
            collect.add({
              data: {
                aid: aid,
                openid : openid
              },
              success: function(res1) {
                console.log(res1)
                wx.showToast({
                  title: '成功收藏',
                  icon: 'success',
                  duration: 1000
                })
                let tmp = that.data.acting
                tmp[index].isCollected = true
                that.setData({
                  acting : tmp
                })
              }
            })
          } else {
            console.log("已被收藏，即将取消收藏")
            collect.doc(res.data[0]._id).remove({ //先查到该收藏记录的_id 再删除
              success(res) {
                console.log(res)
                console.log('已成功取消该收藏');
                wx.showToast({
                  title: '已取消收藏',
                  icon: 'success',
                  duration: 1000
                })
                let tmp = that.data.acting
                tmp[index].isCollected = false
                that.setData({
                  acting : tmp
                })
              }
            })
          }
        }
      })
    }
  },

  onShow: function () {

  },

  viewMore(e) {
    if (e.mark.starMark !== "star") {
      console.log("已点击查看更多按钮 列表", e)
      wx.navigateTo({
        url: '../../packageA/activityDetail/activityDetail?aid=' + e.currentTarget.dataset.id,
      })
    }
  },

  formatDate(date) {
    date = new Date(date);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = (date.getDate()).toString().padStart(2, '0');
    var time = year + "/" + month + "/" + day;
    return time;
  },

  // 滚动触底加载下一页活动
  onReachBottom() {
    let today = this.formatDate(new Date())
    this.data.pageId = this.data.pageId + 1
    act.where({
      type: this.data.type_id,
        actTimeEnd: _.gte(today) //查找尚未到截止日期的活动
      })
      .orderBy('actTimeEnd', 'desc')
      .skip(5 * this.data.pageId)
      .limit(5)
      .get()
      .then(
        res => {
          res.data.forEach(function (currentValue, index, arr) { // 对获取到的活动集一一添加是否收藏的属性
            collect.where({
                openid: currentValue.openid,
                aid: currentValue._id
              })
              .get()
              .then(
                res2 => {
                  currentValue.isCollected = res2.data.length > 0 ? true : false
                },
              )
          })
          setTimeout(() => {
            this.setData({
              acting: [...this.data.acting, ...res.data] //获取到活动的raw数据 直接赋值给acting
            })
          }, 700);
        }
      )
  },

  // 下拉刷新
  onPullDownRefresh() {
    let today = this.formatDate(new Date())
    this.setData({
      openid:'',
      type_id: '',
      type_name: '',
      acting: [],
      // 标识当前page
    pageId: 0
    })
    this.onLoad()
  },

})