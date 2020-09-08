let util = require('../../utils/util.js');
wx.cloud.init({
    env: 'x1-vgiba'
})
const db = wx.cloud.database({
    env: 'x1-vgiba'
})
const act = db.collection('activity')
const collect = db.collection('collect')
const _ = db.command


Page({
    data: {
        openid: "",
        collectIcon: 'star-o', // 收藏按钮的默认设置
        collectColor: '#80a0c0',
        isCollected: {},

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
        }],

        //活动集 | 正在进行的
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

    onLoad: function(options) {},


    onShow: function() {
        // tabbar
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                active: 0
            })
        }
        this.showDate();
        let today = this.formatDate(new Date())
        act.where({
                actTimeEnd: _.gt(today)
            })
            .get()
            .then(
                res => {
                    this.setData({
                        acting: res.data
                    })
                },
            )
            .catch(console.error)
        collect.get({
            success: function(res) {
                for (var index in res.data) {
                    res.data.infos[index].info_file = res.data.infos[index].info_file.split(',');
                }
            }
        })
    },

    //点击收藏按钮的事件
    collect(e) {
        if (e.mark.starMark === "star") {
            console.log(e)
            console.log(openid)
            console.log("Collecting")
            let that = this
            let aid = e.currentTarget.dataset.collectid
                // 先获取活动索引(是数组的index，而非_id噢；因为点击事件event只能捕捉到这是acting数组的第几个，所以通过index去数组里找该活动的_id信息) 
            collect.where({
                _openid: openid,
                aid: aid
            }).get({
                success: function(res) {
                    console.log(res)
                    if (res.data.length == 0) { //如果未收藏，需要改为已收藏
                        collect.add({
                            data: {
                                aid: aid
                            }
                        })
                        that.data.isCollected[aid] = true
                    } else { //如果已收藏，需要改为未收藏
                        // this.setData({
                        //   pattern: 'star-o',
                        //   color: '#80a0c0',
                        // })
                        collect.where({ //再更新数据库的收藏表
                            _id: res.data._id,
                            openid: openid
                        }).remove({ //先查到该收藏记录的_id 再删除
                            success(res) {
                                console.log(res)
                                console.log('已成功取消该收藏');
                                that.data.isCollected[aid] = false
                                wx.showToast({
                                    title: '已取消收藏',
                                })
                            }
                        })
                    }
                }
            })
        }
    },
    /*onShow: function() {
      // tabbar
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
          active: 0
        })
      }

      let openid = this.data.openid

      // 设置日期
      let today = this.formatDate(new Date())

      let obj = {}
      let {
        acting
      } = this.data // ES6语法
      let collected = []
      //以下首先通过时间查找到对应活动的id 并到注册表及收藏表查询 

      const _ = db.command
      // 查找该用户收藏了哪些活动 存在本地 留给下面activity查询的结果去匹配 
      collect.where({
        openid: openid
      }).get({
        success(res0) {
          console.log("收藏结果", res0)
          for (let index = 0; index < res0.length; index++) {
            collected.push(res.data[index].aid);
            console.log("push测试", collected) //此处好像有问题
          }

          act.where({
              actTimeEnd: _.gt(today)
            })
            .orderBy('actTimeBegin', 'desc')
            .limit(100)
            .get({
              success(res) {
                console.log("new:", res)
                // 以下为获取活动信息的回调函数
                if (res.data.length != 0) { //返回非空数据集时,依次给中间变量集合obj赋值，填充好后，再赋给acting数组
                  for (let i = 0; i < res.data.length; i++) {
                    obj.id = i
                    obj.aid = res.data[i]._id //此处为活动id
                    obj.title = res.data[i].title //活动标题
                    obj.host = res.data[i].host //活动举办部门
                    obj.lable = res.data[i].lable || '暂无' //活动标签
                    obj.addr = res.data[i].addr //活动地点
                    obj.actTimeBegin = res.data[i].actTimeBegin
                    obj.actTimeEnd = res.data[i].actTimeEnd
                    obj.regNum = res.data[i].regNum
                    console.log("test", i, obj)
                    // 检测目前的活动 是否被收藏
                    // console.log("收藏测试",collected)
                    // if (collected.indexof(obj.aid) != -1) {
                    //   console.log(i, "未收藏", obj)
                    //   obj.collect = 1
                    //   obj.pattern = "star"
                    //   obj.color = "goldenrod"
                    // } else {
                    //   console.log(i, "已收藏", obj)
                    //   obj.collect = 0
                    //   obj.pattern = "star-o"
                    //   obj.color = "#80a0c0"
                    // }
                    // console.log("test0000")
                    acting.push(Object.assign({}, obj))
                  }
                  console.log("seted", acting)
                  this.setData({
                    acting: acting
                  })
                  console.log("seted2", this.data.acting)
                } else { //查询失败时
                  console.log("查询结果为0条")
                }
              }
            })
        }
      })
    },*/

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
        if (e.mark.starMark !== "star") {
            console.log(e)
            let id = e.currentTarget.dataset.id
            console.log(id)
                // console.log(this.data.acting)
            console.log("e", e)
                // let _id = this.data.acting[index]._id
            console.log("当前点击的活动id为", id)
            wx.navigateTo({
                url: '../../packageA/activityDetail/activityDetail?aid=' + id,
            })
        }
    },
    // 点击筛选按钮后 弹出模态框 进行条件筛选
    select(e) {

    },
    formatDate(date) {
        date = new Date(date);
        var year = date.getFullYear();
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var day = (date.getDate()).toString().padStart(2, '0');
        var time = year + "/" + month + "/" + day;
        return time;
    },
    showDate(date) {
        var timestamp = Date.parse(new Date());
        var today = new Date();
        var monthEnglish = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        this.setData({
            year: today.getFullYear(),
            month: monthEnglish[today.getMonth()],
            day: today.getDate() < 10 ? '0' + today.getDate() : today.getDate()
        })
    },
    linkToMe() {
        wx.navigateTo({
            url: '../../packageA/info/info',
        })
    }
})