var util = require('../../utils/util.js');
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const act = db.collection('activity')
const _ = db.command

Page({
  data: {
    //顶部tabbar
    tabbar: 0,

    //类型分区
    types: [{
      type: '学习',
      icon: 'smile-o',
    }, {
      type: '',
      icon: '',
    }],

    // 有id的type
    actType: [],
    // 无id的type
    typeCollection: [],

    actLine: [],
  },

  onLoad: function () {
    this.getTypes();
    // this.actInit();
  },
  getTypes() {
    db.collection('type').get().then(
      res => {
        console.log('types', res.data)
        var actType = res.data
        var typeCollection = actType.map(values => values.type_name)
        console.log(typeCollection);
        // this.addCount(actType);
        this.setData({
          actType: actType,
          typeCollection: typeCollection
        })
      }
    )
  },
  addCount(actType) {
    actType.forEach(function(current, index, arr) {
      console.log(current);
      current['type_count'] = this.getActCount(current._id)
      arr[index] = current
    })
    this.setData({
      actType: actType,
    })
  },
  getActCount(type_id) {
    console.log(type_id);    
    let result = act.where({
      type: type_id
    }).count();
    let count = result.total
    return count
  },
  onShow: function () {
    // tabbar
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 1
      })
    }
    this.onSelect({detail: new Date()})
  },
  //切换顶部tab
  onChangeTab(event) {
    console.log(event)
    this.setData({
      tabbar: e.detail.name
    })
  },

  formatDate(date) {
    // date = new Date(date);
    // console.log("date", date)
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = (date.getDate()).toString().padStart(2, '0');
    var time = year + "/" + month + "/" + day;
    return time;
  },

  showAct(e) {
    let a = e.currentTarget.dataset
    this.actInit(a.year, a.month, a.datenum)
  },
  onChangeTabbar(e) {
    console.log(e.detail)
    this.setData({ activeTab: e.detail });
  },

  onSelect(e) {
    this.setData({
      actLine: []
    })
    console.log(e.detail)
    var that = this
    let actLine = that.data.actLine
    var obj = {}
    var date = this.formatDate(e.detail)
    act.where({
      actTimeBegin: _.lte(date),
      actTimeEnd: _.gte(date)
    }).get({
      success(res) {
        console.log(res)
        if (res.data.length != 0) {   //查询成功时
          for (let i = 0; i < res.data.length; i++) {
            obj.id = res.data[i]._id
            obj.title = res.data[i].title
            obj.host = res.data[i].host
            actLine.push(Object.assign({}, obj))
          }
        } else {                      //查询失败时
          console.log("无查询结果")
        }
        that.setData({ actLine: actLine })
      }
    })
  }, 
  onScroll() {
  }
});