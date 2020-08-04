var util = require('../../utils/util.js');
wx.cloud.init({env: 'x1-vgiba'})
const db = wx.cloud.database({env: 'x1-vgiba'})
const act = db.collection('activity')
const reg = db.collection('register')
const collect = db.collection('collect')


Page({
  data: {
    testnum : 1,
    openid: "",
    collectIcon: 'star-o', // 收藏按钮的默认设置
    collectColor: '#80a0c0',

    //今天的时间；需写一个函数，先调取当天日期，再转换格式进行setData，最后渲染到前端页面顶端的时间栏
    year: 2020,
    month: 'Aug',
    day: 3,
     
    //用于测试的静态数据
    acting: [{
      id: 0,
      aid: 'b58263a25f2829950054151f2d77a647',
      title: '全国大学生数学建模竞赛(国内)',
      host: '数理学院',
      lable: ['学习', '竞赛'],
      addr: '本部 四教',
      regNum: 233,
      actTimeEnd: '2020/7/30',
      collect: 0
    },{
      id: 1,
      aid: 'b58263a25f282c3d005445dc2cfd16b8',
      title: '毕业季捐书活动',
      host: '校学生会',
      lable: ['公益'],
      addr: '线上',
      regNum: 53,
      actTimeEnd: '2020/7/30',
      collect: 0
    }], //活动集 | 正在进行的

    //以下为测试的静态数据
    act1: {
      id: 0,
      aid:'0d06a2fd5f282af60049935b10c59212',
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

  //点击收藏按钮的事件
  collect(e) {
    console.log(e)
    let that = this
    let acting = that.data.acting
    // 先获取活动索引(是数组的index，而非aid噢；因为点击事件event只能捕捉到这是acting数组的第几个，所以通过index去数组里找该活动的aid信息) 
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
          aid: acting[index].aid,
          uid: uid
        }
      })
    } else { //如果已收藏，需要改为未收藏
      this.setData({
        patten: 'star-o',
        color: '#80a0c0',
      })
      collect.where({ //再更新数据库的收藏表
        aid: acting[id].id,
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
  
  onShow: function () {

    //加载tabbar
    this.getTabBar().init();

    let openid = this.data.openid           //用户openid
    let today = this.formatDate(new Date()) // 加载今日时间
    var obj = {}                            //存放数据库查询结果的临时对象
    console.log("数据库查询前的acting",this.data.acting)
    var {acting} = this.data //网上看到的写法，好像是表示新建了一个与data里同名的变量，并且与data里赋值相同
    //以下首先通过时间查找到对应活动的id 并到注册表及收藏表查询 
    //但以下代码时间复杂度较高 为三表数据集的乘积 o(xyz)  需优化！
    const _ = db.command
    act.where({
        actTimeEnd: _.gt(today)
      })
      .orderBy('actTimeBegin', 'desc')
      .limit(100)
      .get({
        success(res) {
          console.log("查询成功",res.data.length)
          if (res.data.length != 0) { //返回非空数据集时,依次给中间变量集合obj赋值，填充好后，再赋给acting数组

            for (let i = 0; i < res.data.length; i++) {
              obj.id = i
              obj.aid = res.data[i]._id //此处为活动id
              obj.title = res.data[i].title //活动标题
              obj.host = res.data[i].host //活动举办部门
              obj.lable = res.data[i].lable || '暂无'//活动标签
              obj.addr = res.data[i].addr //活动地点
              obj.actTimeBegin = res.data[i].actTimeBegin
              obj.actTimeEnd = res.data[i].actTimeEnd
              //报名人数
              reg.where({
                aid: obj.aid
              }).get({
                success(res2) {
                  // console.log(i,"报名情况查询",res2)
                  obj.regNum = res2.data.length //这里的regNum并没被放入obj里 为什么呢qwq 呜呜好难啊好难啊T^T
                },
                fail(err2){
                  console.log(obj.title,i,"未查询到报名情况")
                }
              })
              //是否被当前用户收藏
              collect.where({
                aid: obj.aid,
                openid: openid
              }).get({
                success(res3) { //收藏表有相应记录 则说明被收藏啦 以下设置收藏符号样式 由前端渲染
                  // console.log(i,"收藏记录查询",res3)
                  if(res.data.length != 0){
                    // console.log(i,"查询到收藏记录 且未收藏",res3)
                    obj.collect = 1
                    obj.patten = "star"
                    obj.color =  "goldenrod"
                  }else{
                    // console.log(i,"查询到收藏记录 且已收藏",res3)
                    obj.collect = 0
                    obj.patten = "star-o"
                    obj.color = "#80a0c0"
                  }  
                },
                fail(err3) {
                  console.log(i,"收藏记录查询失败",err3)
                  obj.patten = "star-o"
                  obj.color = "#80a0c0"
                }
              })
              // console.log(i,"这是一个obj",obj)
             
              acting.push(Object.assign({}, obj))
              this.setData({acting})
              console.log(i,"push后的acting",acting)
            }
            console.log("最终push后的acting",acting)

            // this.setData({acting})
            console.log("push后的acting2",acting)
          } else { //查询失败时
            console.log("查询结果为0条")
          }
        }
      })
  },

  //点击查看更多(MORE)，跳转至活动详情页
  viewMore1(e) {
    console.log(e)
    let that = this
    let aid = that.data.act1.aid
    console.log("当前点击的活动id为",aid)
    wx.navigateTo({
      url: '../../packageA/activityDetail/activityDetail?aid='+aid,
    })
  },
  viewMore(e) {
    console.log(e)
    let that = this
    let index = e.currentTarget.id
    let aid = that.data.acting[index].aid
    console.log("当前点击的活动id为",aid)
    wx.navigateTo({
      url: '../../packageA/activityDetail/activityDetail?aid='+aid,
    })
  },
  formatDate(date) {
    date = new Date(date);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = (date.getDate()).toString().padStart(2, '0');
    var time = year + "/" + month + "/" + day;
    return time;
  },
  linkToMe(){
    wx.navigateTo({
      url: '../../packageA/info/info',
    })
  }
})