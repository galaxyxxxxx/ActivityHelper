Component({
  data: {
    active: 0,
    list:[
      {
        "url": "../home/home",
        "icon": 'wap-home',
        // "text": "HOME"
      },
      {
        "url": "../discovery/discovery",
        "icon": 'weapp-nav',
        // "text": "DISCOVERY"
      },
      {
        "url": "../me/me",
        "icon": 'manager',
        // "text": "ME"
      }
    ]
  },

  methods: {
    onChange: function (event) {
      console.log(event)
      this.setData({
        active: event.detail
      });
      wx.switchTab({
        url: this.data.list[event.detail].url,
      })
    },
    init() {
      const page = getCurrentPages().pop();
      this.setData({
     　  active: this.data.list.findIndex(item => item.url === `/${page.route}`)
      });
    }
  }
})