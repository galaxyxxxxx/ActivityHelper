var util = require('../../utils/util.js');
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const act = db.collection('activity')

Page({
  data: {
    //顶部tabbar
    tabbar: 0,

    //类型分区
    types:[{
      type:'学习',
      icon:'smile-o',
    },{
      type:'',
      icon:'',
    }],


    //日历分区
    return_date: 'Jul 2020',  //头部返回栏的时间标注 不同状态显示格式不同
    year : '',  //当前年份
    month : '', //当前月份
    weekArr: ['S','M','T','W','T','F','S'],
    dateArr: [],
    isToday: 0,
    isTodayWeek: false,
    todayIndex: 0,

    day : '',   //当前天
    week : '',  //当前周几
    week1 : '', 
    monthDay : '',

    actLine: [],
    actLine1: [{
      title : "test1",
      host : "host1"
    },{
      title : "test2",
      host : "host2"
    },{
      title : "test3",
      host : "host3"
    }]
  },

  onLoad: function(){
    
    //日历部分
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    this.dateInit();
    this.setData({
      year: year,
      month: month,
      isToday: '' + year + month.toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0')
    })
    this.actInit();
  },  
  onShow: function () {
    // tabbar
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        active: 1
      })
    }
  },
  //切换顶部tab
  onChangeTab(event) {
    console.log(event)
    wx.showToast({
      title: `切换到 ${event.detail.title}`,
      icon: 'none',
      duration: 500
    });
  },
  //日历部分的函数
  //关于日期的显示：视图层显示的是带斜杠的(eg 1999/8/15)
  //数据库里存储的和逻辑层均为便于比较的YYYYMMDD格式(eg 19990615)
  formatDate(date) {
    date = new Date(date);
    console.log("date",date)
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = (date.getDate()).toString().padStart(2, '0');
    var time = year + "/" + month + "/" + day;
    return time;
  },
  dateInit: function (setYear, setMonth) {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let dateArr = [];                                                             //需要遍历的日历数组数据
    let arrLen = 0;                                                               //dateArr的数组长度
    let now = setYear ? new Date(setYear, setMonth) : new Date();
    let year = setYear || now.getFullYear();
    let nextYear = 0;
    let month = setMonth || now.getMonth();                                       //没有+1方便后面计算当月总天数
    let nextMonth = (month + 1) > 11 ? 1 : (month + 1);
    let startWeek = new Date(year + ',' + (month + 1) + ',' + 1).getDay();        //目标月1号对应的星期
    let dayNums = new Date(year, nextMonth, 0).getDate();                         //获取目标月有多少天
    let obj = {};
    let num = 0;
    if (month + 1 > 11) {
      nextYear = year + 1;
      dayNums = new Date(nextYear, nextMonth, 0).getDate();
    }
    arrLen = startWeek + dayNums;
    for (let i = 0; i < arrLen; i++) {
      if (i >= startWeek) {
        num = i - startWeek + 1;
        obj = {
          isToday: '' + year + (month + 1).toString().padStart(2, '0') + num.toString().padStart(2, '0'),
          dateNum: num,
          activity: 1,
          weight: 5   //????
        }
      } else {
        obj = {};
      }
      dateArr[i] = obj;
    }
    this.setData({
      dateArr: dateArr
    })
    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowWeek = nowDate.getDay();
    let getYear = setYear || nowYear;
    let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;
    if (nowYear == getYear && nowMonth == getMonth) {
      this.setData({
        isTodayWeek: true,
        todayIndex: nowWeek
      })
    } else {
      this.setData({
        isTodayWeek: false,
        todayIndex: -1
      })
    }
  },
  showAct(e){
    let a = e.currentTarget.dataset
    this.actInit(a.year, a.month, a.datenum)
  },
  actInit: function(setYear, setMonth, setDay){
    var that = this
    let actLine = that.data.actLine
    var obj = {}
    let now = new Date()
    console.log(typeof(setYear))
    var date = ''
    if(setYear != null){
      let dateSet = setYear + "/" + setMonth.toString().padStart(2, '0') + "/" + setDay.toString().padStart(2, '0')
      date = dateSet
    }else{
      date = this.formatDate(now)
    }
    console.log(date)
    act.where({
      actTimeBegin : date
    }).get({
      success(res){
        if(res.data.length != 0){   //查询成功时
          for(let i = 0; i < res.data.length; i++){
            obj.id = res.data[i]._id
            obj.title =  res.data[i].title
            obj.host =  res.data[i].host
            actLine.push(Object.assign({}, obj)) 
          }
        }else{                      //查询失败时
            console.log("无查询结果")
        }
        that.setData({actLine : actLine})
      }
    })
  },
  /**
   * 上月切换
   */
  lastMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
    let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
  },
  /**
   * 下月切换
   */
  nextMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
    let month = this.data.month > 11 ? 0 : this.data.month;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
  },
  onChangeTabbar(e){
    console.log(e.detail)
    this.setData({activeTab : e.detail});
  },
  returnTab(){
    wx.redirectTo({
      url: '/miniprogram/pages/home/home',
    })
  },
  //转换tab时 更改其tabbar值
  changeTab(e){
    console.log("tab2 打印转换tab事件值",e)
    this.setData({
      tabbar : e.detail.name
    })
  },
});