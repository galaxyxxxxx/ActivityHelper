// packageA/list/list.js
wx.cloud.init({
  env: 'x1-vgiba'
})
const db = wx.cloud.database({
  env: 'x1-vgiba'
})
const act = db.collection('activity')
const type = db.collection('type')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type_id: '',
    type_name: '',
    acting: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    act.where({
      type: this.data.type_id
    }).get().then(
      res => {
        this.setData({
          acting: res.data
        })
      })
  },

  viewMore(e) {
    if (e.mark.starMark !== "star") {
      console.log("已点击查看更多按钮 列表", e)
      wx.navigateTo({
        url: '../../packageA/activityDetail/activityDetail?aid=' + e.currentTarget.dataset.id,
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})