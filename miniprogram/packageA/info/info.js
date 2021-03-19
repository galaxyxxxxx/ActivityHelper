var util = require('../../utils/util.js');
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

wx.cloud.init({
  env: 'x1-vgiba'
});
const db = wx.cloud.database({
  env: 'x1-vgiba'
});
const user = db.collection('user');
const departments = {
  信息学部: ['', '自动化', '电子信息工程', '通信工程', '电子科学与技术', '微电子科学与工程', '机器人工程', '计算机科学与技术', '物联网工程', '信息安全', '软件工程', '数字媒体技术'],
  材制学部: ['', '机械工程', '测控技术与仪器', '材料科学与工程', '资源循环科学与工程', '纳米材料与技术'],
  城建学部: ['', '土木工程', '给排水科学与工程', '建筑环境与能源应用工程', '交通工程', '交通设备与控制工程', '城乡规划', '建筑学'],
  环生学部: ['', '环境工程', '环境科学', '能源动力与工程', '新能源科学与工程', '应用化学', '食品质量与安全', '生物技术', '生物医学工程'],
  经管学院: ['', '信息管理与信息系统', '经济统计学', '金融学', '会计学', '国际经济与贸易', '文化产业管理', '工商管理', '市场营销'],
  艺设学院: ['', '视觉传达设计', '环境设计', '产品设计', '服装与服饰设计', '工艺美术', '绘画', '雕塑', '数字媒体艺术', '工业设计', '广告学'],
  理学部: ['', '数学与应用数学', '信息与计算科学', '应用物理', '统计学'],
  文法学部: ['', '英语', '法学', '社会学', '社会工作'],
  樊恭烋荣誉学院: [''],
  都柏林学院: ['', '电子信息工程', '物联网工程', '软件工程', '金融学']
};

Page({
  data: {
    aid: '', //可能是从活动页跳转过来填信息的，此处aid是为了navigateBack
    openid: '',
    name: '',
    uid: '',
    tel: '',
    email: '',
    dep1: '',
    dep2: '',
    org: '',
    role: '',
    registed: 0, //标记数据库里是否已有该用户  用以判断该信息修改操作对数据库是add还是update
    change: 0, //标记当前页面数据是否有改动
    dep1temp: '',
    dep2temp: '',

    department: [{
        values: Object.keys(departments),
        className: 'column1',
      },
      {
        values: departments['信息学部'],
        className: 'column2',
        defaultIndex: 0,
      }
    ],
    showDep: false,
  },

  onLoad(option) {
    let openid = wx.getStorageSync('openid');
    this.setData({
      openid: openid,
      role: wx.getStorageSync('role'),
      org: wx.getStorageSync('org')
    });

    let that = this
    user.where({
      _openid: openid
    }).get({
      success(res) {
        console.log(res)
        if (res.data.length > 0) {
          let u = res.data[0];
          that.setData({
            name: u.name,
            uid: u.uid,
            tel: u.tel,
            email: u.email,
            dep1: u.dep1,
            dep2: u.dep2,
            registed: 1
          });
        }

      }
    });
  },

  onChange(e) {
    this.setData({
      change: 1
    })
  },

  onShowDep(e) {
    this.setData({
      showDep: true
    });
  },

  onChangeDep(e) {
    const {
      picker,
      value,
      index
    } = e.detail;
    picker.setColumnValues(1, departments[value[0]]);
    let dep1temp = this.data.dep1temp;
    let dep2temp = this.data.dep2temp;
    console.log('test dep', e);
    if (dep1temp == '') {
      this.setData({
        dep1temp: e.detail.value[0],
        dep2temp: e.detail.value[1]
      });
    } else if (dep1temp != '' && e.detail.value[0] != dep1temp) {
      this.setData({
        dep1temp: e.detail.value[0],
        dep2temp: ''
      });
    } else {
      this.setData({
        dep1temp: e.detail.value[0],
        dep2temp: e.detail.value[1]
      });
    }
  },
  onCancelDep(e) {
    this.setData({
      dep1temp: '',
      dep2temp: '',
      showDep: false,
    });
  },
  onCloseDep(e) {
    this.setData({
      dep1temp: '',
      dep2temp: '',
      showDep: false
    });
  },
  onConfirmDep(e) {
    console.log('test temp', this.data.dep1temp, this.data.dep2temp);
    this.setData({
      dep1: this.data.dep1temp,
      dep2: this.data.dep2temp,
      change: 1,
      showDep: false,
    });
  },

  //点击学号 / 电话时的提示信息
  tips1(e) {
    Dialog.alert({
      message: '该信息将帮助平台向您个性化推荐😎',
      confirmButtonText: 'ok辛苦啦!'
    }).then(() => {
      // on close
    });
  },
  tips2(e) {
    Dialog.alert({
      message: '该信息仅提供给您所报名活动的主办方😁',
      confirmButtonText: 'ok理解'
    }).then(() => {
      wx.showToast({
        title: 'QAQ不客气!!!',
        icon: 'none',
        duration: 1000
      });
    });
  },

  //社团身份认证
  identify(e) {
    Dialog.confirm({
        context: this,
        customStyle: 'font-size: var(--font-size-S);line-height: 50rpx;',
        closeOnClickOverlay: 'true',
        messageAlign: 'left',
        // customStyle: 'font-size:var(--font-size-S)',
        confirmButtonText: '申请认证',
        cancelButtonText: '暂不申请',
        message: '认证社团身份后可代表社团发布活动:D\n\n认证方法\n1 填写并提交当前页个人信息 \n2 点击申请认证按钮\n3 填写新页面部门信息',
      })
      .then(() => {
        console.log('用户确定认证');
        if (this.data.registed == 0) {
          if (this.data.change == 1) {
            wx.showToast({
              title: '请先对已更改的信息进行提交',
              icon: 'error',
              duration: 1500
            });
          } else {
            wx.showToast({
              title: '请先完善个人信息 并提交',
              icon: 'error',
              duration: 1500
            });
          }
        } else {
          wx.navigateTo({
            url: '../../packageB/inputOrg/inputOrg',
          });
        }
      })
      .catch(() => {
        console.log('用户取消认证');
      });
  },

  //增改个人信息
  submit(e) {
    let that = this;
    let _id = that.data._id;
    let openid = that.data.openid;
    let name = that.data.name;
    let uid = that.data.uid;
    let tel = that.data.tel;
    let email = that.data.email;
    let dep1 = that.data.dep1;
    let dep2 = that.data.dep2;
    let registed = that.data.registed;
    let change = that.data.change;

    //检验是否有数据更改
    if (change == 0) {
      wx.showToast({
        title: '未修改任何信息',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    //格式校验
    if (name == '' || name != '' && util.haveSpechars(name)) {
      wx.showToast({
        title: '请输入正确的姓名',
        icon: 'none',
        duration: 1500
      });
      this.setData({
        name: ''
      });
      return;
    }
    if (uid == '') {
      console.log(util.isUid(parseInt(uid)));
      wx.showToast({
        title: '请输入正确的学号',
        icon: 'none',
        duration: 1500
      });
      this.setData({
        uid: ''
      });
      return;
    }
    if (tel == '' && email == '') {
      wx.showToast({
        title: '请输入至少一种联系方式',
        icon: 'none'
      });
      return;
    }
    if (tel != '' && !util.isTel(parseInt(tel))) {
      wx.showToast({
        title: '手机号格式有误，请重新输入',
        icon: 'none',
        duration: 1500
      });
      this.setData({
        tel: ''
      });
      return;
    }
    if (email != '' && !util.isEmail(email)) {
      wx.showToast({
        title: '邮箱格式有误，请重新输入',
        icon: 'none',
        duration: 1500
      });
      this.setData({
        email: ''
      });
      return;
    }
    if (dep1 == '') {
      wx.showToast({
        title: '尚未输入院系信息',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    //满足条件判断后，进行更新/写入
    if (this.data.registed == 0) { //未注册
      let that = this;
      user.add({
        data: {
          name: name,
          openid: openid,
          uid: uid,
          tel: tel,
          email: email,
          dep1: dep1,
          dep2: dep2,
          role: 0
        },
        success() {
          wx.showToast({
            title: '已成功完善信息',
            icon: 'success',
            duration: 2000
          });
          that.setData({
            registed: 1,
            role: 0
          });
        }
      });
    } else { //已注册的
      user.where({
        openid: this.data.openid
      }).update({
        data: {
          name: name,
          uid: uid,
          tel: tel,
          email: email,
          dep1: dep1,
          dep2: dep2
        },
        success(res) {
          wx.showToast({
            title: '已成功完善信息',
            icon: 'success',
            duration: 1000
          });
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)

        }
      });
    }
  }
});