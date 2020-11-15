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
    计算机学院: ['', '计算机科学与技术', '信息安全', '软件工程', '物联网工程', '数字媒体技术'],
    经管学院: ['', '信息管理与信息系统', '文化产业管理', '工商管理', '会计', '金融'],
    机电学院: ['', '机械工程', '自动化', '测控'],
    艺设学院: ['', '美术', '数字媒体艺术', '雕塑', '工业设计', '广告'],
    数理学院: ['', '应用数学', '应用物理', '计算与信息科学'],
    文法学部: ['', '英语', '法学', '社会学'],
};

Page({
    data: {
        _id: '',
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
                values: departments['计算机学院'],
                className: 'column2',
                defaultIndex: 0,
            },
        ],

        showDep: false,
    },


    onLoad(option) {
        let opid = option.openid;
        this.setData({
            openid: opid,
            role: wx.getStorageSync('role'),
            org: wx.getStorageSync('org')
        });
        let openid = this.data.openid;


        let that = this;
        user.where({
            _openid: openid
        }).get({
            success(res) {
                console.log(res);
                that.setData({
                    _id: res.data[0]._id,
                    name: res.data[0].name,
                    uid: res.data[0].uid,
                    tel: res.data[0].tel,
                    email: res.data[0].email,
                    dep1: res.data[0].dep1,
                    dep2: res.data[0].dep2,
                    registed: 1
                });
            }
        });
    },

    onChangeName(e) {
        let that = this;
        that.setData({
            name: e.detail,
            change: 1
        });
    },
    onChangeUid(e) {
        let that = this;
        that.setData({
            uid: e.detail,
            change: 1
        });
    },
    onChangeTel(e) {
        let that = this;
        that.setData({
            tel: e.detail,
            change: 1
        });
    },
    onChangeEmail(e) {
        let that = this;
        that.setData({
            email: e.detail,
            change: 1
        });
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
            message: '该信息仅提供给您所报名活动的主办方😁',
            confirmButtonText: 'ok理解'
        }).then(() => {
            // on close
        });
    },
    tips2(e) {
        Dialog.alert({
            message: '该信息将帮助平台向您个性化推荐😎',
            confirmButtonText: 'ok辛苦啦!'
        }).then(() => {
            wx.showToast({
                title: 'QAQ不客气!!!',
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
                            icon: 'none',
                            duration: 1500
                        });
                    } else {
                        wx.showToast({
                            title: '请先完善个人信息 并提交',
                            icon: 'none',
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
        } else {
            //格式校验
            if (name != '' && util.haveSpechars(name)) {
                wx.showToast({
                    title: '姓名格式错误',
                    icon: 'none',
                    duration: 1500
                });
                this.setData({
                    name: null
                });
                return;
            }
            if (uid == '' || uid == null || !/^[0-9]+$/.test(uid) || !util.isUid(parseInt(uid))) {
                console.log(util.isUid(parseInt(uid)));
                wx.showToast({
                    title: '请输入正确的学号',
                    icon: 'none',
                    duration: 1500
                });
                this.setData({
                    uid: null
                });
                return;
            }
            if (tel != '' && !util.isTel(parseInt(tel))) {
                wx.showToast({
                    title: '该手机号不存在，请重新输入',
                    icon: 'none',
                    duration: 1500
                });
                this.setData({
                    tel: null
                });
                return;
            }
            if (email != '' && !util.isEmail(email)) {
                wx.showToast({
                    title: '该邮箱不存在，请重新输入',
                    icon: 'none',
                    duration: 1500
                });
                this.setData({
                    email: null
                });
                return;
            } else {
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
                        success(res) {
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
                            dep2: dep2,
                            role: 0
                        },
                        success(res) {
                            wx.showToast({
                                title: '已成功完善信息',
                                icon: 'success',
                                duration: 3500
                            });
                            this.setData({
                                registed: 1
                            });
                        }
                    });
                }
            }
        }
    }
});