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
    openid: '',
    searchInput: '',
    searchRes: [],
    searchHistory: [],
    isEmpty: false,
    showHistory: true,
    emptyImg: ''
  },

  onLoad: function (options) {
    this.setData({
      isEmpty: false,
      searchRes: null,
      searchRes: [],
      searchInput: '',
      emptyImg: wx.getStorageSync('emptyImg')
    })
  },

  onShow() {
    this.setData({
      isEmpty: false,
      searchRes: null,
      searchInput: '',
      searchRes: [],
      searchHistory: [],
    })
    this.getHistory();
  },

  getHistory() {
    db.collection('search').where({
        _openid: wx.getStorageSync('openid')
      })
      .orderBy('time', 'desc')
      .limit(5)
      .get()
      .then(res => {
        console.log("搜索历史", res.data)
        this.setData({
          searchHistory: res.data
        })
      })
  },

  onFocus(e) {
    console.log("focus", e)
    this.setData({
      isEmpty: false,
      searchRes: [],
      showHistory: true,
      searchInput: '',
      searchHistory: [],
    })
    this.getHistory()
  },
  onBlur(e) {
    // console.log("blur",e)
  },
  onClear(e) {
    console.log("clear", e)
    this.setData({
      searchInput: ''
    })
  },
  onChange(e) {
    console.log("change", e)
    this.setData({
      searchInput: e.detail
    })
  },
  search(e) {
    console.log("click", e)
    let text = e.target.dataset.text
    let that = this
    act.where(_.or([{
          title: db.RegExp({
            regexp: '.*' + text,
            options: 'i',
          })
        },
        {
          addr: db.RegExp({
            regexp: '.*' + text,
            options: 'i',
          })
        },
        {
          host: db.RegExp({
            regexp: '.*' + text,
            options: 'i',
          })
        }
      ]))
      .get({
        success(res) {
          console.log("查询成功", res)
          console.log("查询成功 长度", res.data.length)
          if (res.data.length == 0) {
            that.setData({
              isEmpty: true
            })
          } else {
            that.setData({
              showHistory: false,
              searchRes: res.data
            })
          }
        },
        fail(err) {
          console.log("查询失败", err)
        }
      })
  },
  onSearch(e) {
    console.log(e)
    this.setData({
      showHistory: false
    })
    if (this.data.searchInput == '') {
      wx.showToast({
        title: '请先输入搜索内容',
        duration: 1500,
      })
      return;
    }
    let that = this
    let searchRes = that.data.searchRes
    let searchInput = that.data.searchInput
    console.log("搜索结果", searchRes)
    console.log("搜索内容", searchInput)

    // 模糊查询 
    // 包含字段：活动标题 / 活动地点 / 举办方
    // - by regExp
    act.where(_.or([{
          title: db.RegExp({
            regexp: '.*' + searchInput,
            options: 'i',
          })
        },
        {
          addr: db.RegExp({
            regexp: '.*' + searchInput,
            options: 'i',
          })
        },
        {
          host: db.RegExp({
            regexp: '.*' + searchInput,
            options: 'i',
          })
        }
      ]))
      .get({
        success(res) {
          console.log("查询成功", res)
          if (res.data.length == 0) {
            that.setData({
              isEmpty: true
            })

          } else {
            that.setData({
              searchRes: res.data
            })
            db.collection('search').add({
              data: {
                time: new Date(),
                text: that.data.searchInput
              },
              success: function (res) {
                console.log("增加搜索历史", res)
              }
            })
          }


        },
        fail(err) {
          console.log("查询失败", err)
        }
      })
  },
  // 查看活动详情
  viewMore(e) {
    console.log(e)
    wx.navigateTo({
      url: '../../packageA/activityDetail/activityDetail?aid=' + e.currentTarget.dataset.id,
    })
  }

})