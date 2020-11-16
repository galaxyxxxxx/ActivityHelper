Component({
  data: {
    active: 0,
    list:[
      {
        'url': '/pages/home/home',
        'icon': '../images/icon/homeSelect.svg',
        'text': '首页'
      },
      {
        'url': '/pages/discovery/discovery',
        'icon': '../images/icon/discoverySelect.svg',
        'text': '发现'
      },
      {
        'url': '/pages/me/me',
        'icon': '../images/icon/meSelect.svg',
        'text': '我的'
      }
    ]
  },

  methods: {
    // tabbar初始化
    init() {
      const page = getCurrentPages().pop();
      this.setData({
        active: this.data.list.findIndex(item => item.url === `/${page.route}`)
      });
    },

    switchTab(e) {
      console.log('switchTab',e);
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({url});
      this.setData({
        active: data.index
      });
    },

    // 更改tabbar
    onChange: function (event) {
      console.log('更改tabbar',event);
      this.setData({
        active: event.detail
      });
      console.log(this.data.list[event.detail].url);
      wx.switchTab({
        url: this.data.list[event.detail].url,
      });
    },
    
  }
});