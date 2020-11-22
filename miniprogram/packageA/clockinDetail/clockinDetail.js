var util = require('../../utils/util.js');
wx.cloud.init({
    env: 'x1-vgiba',
});
const db = wx.cloud.database({
    env: 'x1-vgiba',
});
const app = getApp();
const collect = db.collection('collect');
const _ = db.command;
Page({
    data: {
        openid: '',
        nickName: '',
        avatarUrl: '',
        aid: '',
        comment_input: '',
        comments: [],
        isCollected: false,
        // alreadyTaken: false, //是否已报名
        alreadyClockin: false,
        alreadyClockinText: "",
        reg_id: '',
        activity_detail: {},
        // regNum: 0,
        anonymous: false, // 是否匿名评论 
        defaultPic: 'cloud://x1-vgiba.7831-x1-vgiba-1302076395/activityCover/default.jpg',
        type: '', //用于查询该类别的其他活动
        typeActList: [],
        isRegister: false
    },

    getTypeActList(a) {
        let today = new Date();
        db.collection('activity').where({
                type: a,
                _id: _.neq(this.data.aid)
            })
            .orderBy('actTimeBegin', 'desc')
            .limit(3)
            .get()
            .then(
                res => {
                    console.log('同类别活动查询', res);
                    this.setData({
                        typeActList: res.data
                    });
                }
            );
    },

    onLoad: function (options) {
        // 设置回调，防止小程序globalData拿到空数据
        let that = this;
        // 单页模式
        if (options.scene != 1154) {
            // app.getopenid(that.cb);
            this.setData({
                openid: wx.getStorageSync('openid'),
                nickName: wx.getStorageSync('nickName'),
                avatarUrl: wx.getStorageSync('avatarUrl')
            });
        }
        let aid = options.aid;
        if (!aid) {
            wx.showToast({
                title: '活动不存在',
                icon: 'none',
            });
            setTimeout(() => {
                wx.navigateBack();
            }, 1000);
            return;
        }
        this.setData({
            aid: aid
        });
        this.getComments(aid);
        db.collection('activity').where({
            _id: aid,
        }).get({
            success: (res) => {
                console.log(res);
                var raw = res.data[0] || {};
                this.setData({
                    activity_detail: raw || {},
                    type: res.data[0].type
                });
                setTimeout(() => {
                    this.getTypeActList(res.data[0].type);
                }, 200);
            },
        });
        db.collection('user').where({
            _openid: this.data.openid
        }).get().then(
            res => {
                if (res.data.length === 0) {
                    this.setData({
                        isRegister: false
                    });
                } else {
                    this.setData({
                        isRegister: true
                    });
                }
            }
        );
        // 查询报名情况
        console.log(aid);
        db.collection('clockinList').where({
                aid: aid,
                openid: this.data.openid
            }).get()
            .then(
                res => {
                    setTimeout(() => {
                        if(this.clockinTimeJudge()){                                           //打卡时间的合理性检验
                            if(!this.clockinJudge(res)){                                          //这段时间已经打卡
                                this.setData({
                                alreadyClockin: true,
                                // reg_id: res.data[0]._id,
                                alreadyClockinText: "已经打过啦"
                                // alreadyText: "取消打卡"                                      //有机会可以改成完成打卡
                                })
                            }
                            else this.setData({ alreadyClockin: false, alreadyClockinText: "立即打卡" })
                        }
                        else{                                                                 //这段时间不能打卡
                            this.setData({
                                alreadyClockin: true,
                                // reg_id: res.data[0]._id,
                                alreadyClockinText: "现在不能打哦"
                            })
                        }
                    }, 200);
                }
            );
        db.collection('collect').where({
            aid: aid,
            openid: this.data.openid
        }).get().then(res => {
            console.log('collect', res);
            if (res.data.length > 0) {
                this.setData({
                    isCollected: true
                });
            }
        });
        // db.collection('register').where({
        //     aid: aid
        // }).get().then(
        //     res => {
        //         let regNum = res.data.length;
        //         this.setData({
        //             regNum: regNum
        //         });
        //     },
        // );
    },

    onShow: function () {
        this.getComments(this.data.aid);
    },

    // 一个用来获取openid的回调函数
    // 暂时不再用到
    cb: function (res) {
        let that = this;
        that.setData({
            openid: res
        });
    },

    // 报名
    onClickRegister() {
        // 查询user表 是否已注册个人信息 若无则先注册 跳转至个人信息页
        if (!this.data.isRegister) {
            wx.showToast({
                title: '请先完善个人信息',
                time: 1500
            });
            setTimeout(() => {
                wx.hideToast();
                wx.navigateTo({
                    url: `../info/info?openid=${this.data.openid}`,
                });
            }, 1500);
        } else {
            // 检测是否已报名
            if(!this.clockinTimeJudge()){
                wx.showToast({
                    title: '请在饭点打卡哦',
                    icon: 'success',
                    duration: 1500,
                });
            }
            else if (this.data.alreadyClockin === true) {
                wx.showToast({
                    title: '已经打过啦:)',
                    icon: 'success',
                    duration: 1500,
                });
            } else {
                // let that = this;
                // wx.showLoading({
                //     title: '正在打卡...',
                // });
                // console.log('regular Add');
                // let lessonTmplId = ['w-vPBajcx_ej4CQ6QtmXduAbQT2scKZfN74E67Jj2ZQ', '8Dki6a-8B4bfGKfCgN2gUD9A4OFsb2c_hKoUv5gs2yA', 'CJpRUgZOMZEJVNUIc3-CfXiJXOoZzgd0qKynIeTu0wg']; // 开始、取消、报名成功
                let that = this
                let acting = that.data.activity_detail;
                let now = new Date();
                // 让用户选择一张图片
                wx.chooseImage({
                    success: chooseResult => {
                    wx.showToast({
                        title: '正在上传',
                        icon: 'loading',
                        duration: 1500,
                    });
                    // 将图片上传至云存储空间
                    wx.cloud.uploadFile({
                        // 指定上传到的云路径
                        cloudPath: '光盘行动/'+this.timeToString(now)+'.png',
                        // 指定要上传的文件的小程序临时文件路径
                        filePath: chooseResult.tempFilePaths[0],
                        // 成功回调
                        success: res => {
                            console.log('上传成功', res)
                            db.collection('clockinList').add({
                                data: {
                                    aid: acting._id,
                                    openid: that.data.openid,
                                    regTime: now
                                },
                                success: (res) => {
                                    console.log('success reg res', res);
                                    this.setData({
                                        // reg_id: res._id,
                                        alreadyClockin: true,
                                        alreadyClockinText: '已经打过啦'
                                    });
                                    wx.showToast({
                                        title: '上传成功',
                                        icon: 'success',
                                        duration: 1500,
                                    });
                                },
                            });
                        },
                        fail: err => {
                            // handle error
                            console.log(err);
                            wx.showToast({
                                title: '打卡失败',
                                icon: 'cancel',
                                duration: 1500,
                            });
                          }
                    })
                    },
                })

                // wx.showToast({
                //     title: '报名失败',
                //     icon: 'cancel',
                //     duration: 2000,
                // });
            }
        }
    },
    // 分享按钮
    onShareAppMessage(options) {
        var that = this;
        var form = this.data.activity_detail;
        return {
            title: form.title,
            imageUrl: form.cover,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        };
    },
    // 分享到朋友圈
    onShareTimeline(options) {
        var that = this;
        var form = this.data.activity_detail;
        return {
            title: form.title,
            imageUrl: form.cover,
            success: function (res) {
                // 转发成功
                wx.showToast({
                    title: '分享成功',
                });
            },
            fail: function (res) {
                // 转发失败
            }
        };
    },
    //点击收藏按钮的事件
    onClickStar(e) {
        let that = this;
        let aid = that.data.aid;
        let openid = that.data.openid;
        if (this.data.isCollected === false) {
            console.log('已点击收藏按钮', e);
            wx.showLoading({
                title: '正在收藏...',
            });
            collect.add({
                data: {
                    aid: aid,
                    openid: openid,
                    collectTime: new Date()
                },
                success: function (res1) {
                    console.log(res1);
                    wx.hideLoading();
                    wx.showToast({
                        title: '收藏成功',
                        icon: 'success',
                        duration: 1000
                    });
                    that.setData({
                        isCollected: true
                    });
                }
            });
        } else {
            wx.showLoading({
                title: '正在取消...',
            });
            console.log('已被收藏，即将取消收藏');
            collect.where({
                aid: aid,
                _openid: openid
            }).get().then(res => {
                collect.doc(res.data[0]._id).remove({ //先查到该收藏记录的_id 再删除
                    success(res) {
                        console.log(res);
                        console.log('已成功取消该收藏');
                        wx.hideLoading();
                        wx.showToast({
                            title: '已取消收藏',
                            icon: 'success',
                            duration: 1000
                        });
                        that.setData({
                            isCollected: false
                        });
                    }
                });
            });
        }
    },
    //点击评论按钮
    onClickComment(e) {
        this.setData({
            showCommentDialog: true
        });
    },
    //获取评论
    getComments(id) {
        db.collection('comment')
            .where({
                aid: id,
            })
            .orderBy('time', 'desc')
            .limit(5)
            .get({
                success: (res) => {
                    console.log('获取评论成功', res.data);
                    var that = this;
                    that.setData({
                        comments: res.data
                    });

                },
            });
    },
    cancelComment(e) {
        this.setData({
            showCommentDialog: false,
            comment_input: ''
        });
    },
    // 填写评论
    submitComment() {
        // 空值检测
        if (!this.data.comment_input) {
            wx.showToast({
                title: '您还没有输入',
                icon: 'none',
            });
            return;
        }
        // 安全校验
        var comment = this.data.comment_input;
        let that = this;
        wx.cloud.callFunction({
            name: 'textsec',
            data: {
                text: comment
            },
            success(res) {
                console.log('comment内容安全');
                let data = {
                    aid: that.data.activity_detail._id,
                    comment: that.data.comment_input,
                    nickName: that.data.anonymous == false ? wx.getStorageSync('nickName') : '匿名',
                    time: util.formatTime(new Date()).substring(0, 16)
                };

                db.collection('comment').add({
                    data,
                    success: (res) => {
                        wx.showToast({
                            title: '评论成功',
                        });

                        that.setData({
                            comments: [data, ...that.data.comments], //改为放至头部
                        });
                        that.setData({
                            comment_input: '',
                        });
                    },
                });


            },
            fail(err) {
                wx.showToast({
                    title: '评论存在敏感词汇 请修改',
                    icon: 'none',
                    duration: 3000
                });
                setTimeout(function () {
                    wx.hideToast();
                }, 2000);
                that.setData({
                    comment_input: ''
                });
            }
        });

    },
    onChangeComment(e) {
        this.setData({
            comment_input: e.detail,
        });
    },
    //
    // 右上角分享
    onShareAppMessage(options) {
        var that = this;
        var form = this.data.activity_detail;
        return {
            title: form.title,
            imageUrl: form.coverUrl,
            success: function (res) {
                // 转发成功
                that.shareClick();
            },
            fail: function (res) {
                // 转发失败
            }
        };
    },

    moreTypeList() {
        let type = this.data.type;
        wx.navigateTo({
            url: '../../packageA/list/list?type=' + type,
        });
    },

    call() {
        let contact = this.data.activity_detail.contact;
        if (contact == null || !util.isTel(contact)) {
            return;
        } else {
            wx.makePhoneCall({
                phoneNumber: contact,
            });
        }
    },

    onClickTypeActList(e) {
        console.log(e);

        wx.navigateTo({
            url: '../../packageA/activityDetail/activityDetail?aid=' + e.currentTarget.dataset.id,
        });
    },
/*---------------------------------------------------------------------------------------------------------------------------------*/
    // activityTimeJudge:function(){
    //     let today = new Date()
    //     today = `${today.getFullYear()}/${today.getMonth() + 1 < 10 ? "0" + (today.getMonth() + 1) : today.getMonth() + 1}/${today.getDate() < 10 ? "0" + today.getDate() : today.getDate()}`;
    //     if (this.data.activity_detail.regTimeBegin > today || this.data.activity_detail.regTimeEnd < today) return false
    //     else return true
    // },

    //定义将Date对象转换为字符串函数
    timeToString:function(timeObj){
        var str = "";
        var year = timeObj.getFullYear();
        var month = timeObj.getMonth();
        var date = timeObj.getDate();
        var time = timeObj.toTimeString().split(" ")[0];
        var rex = new RegExp(/:/g);
        str = year+"-"+month+"-"+date+"-"+time.replace(rex,"-");
        return str;
    },

    clockinTimeJudge:function(){
        var myTime = util.formatTime(new Date())
        var nowTime = myTime.substr(11,2) + ":" + myTime.substr(11,2)
        for(var i in this.data.activity_detail.clockinTimeBegin){
            if(nowTime > this.data.activity_detail.clockinTimeBegin[i] && nowTime < this.data.activity_detail.clockinTimeEnd[i]) return true;
        }
        return false;
    },

// 这段时间内有没有打卡
    clockinJudge:function(res){
        var myTime = util.formatTime(new Date())
        var nowTime = myTime.substr(11,2) + ":" + myTime.substr(11,2)
        var timeidx = -1
        for(var i in this.data.activity_detail.clockinTimeBegin){
            if(nowTime > this.data.activity_detail.clockinTimeBegin[i] && nowTime < this.data.activity_detail.clockinTimeEnd[i]) timeidx = i 
        }
        var beginTime = myTime.substr(0,10) + " " + this.data.activity_detail.clockinTimeBegin[timeidx]
        var endTime = myTime.substr(0,10) + " " + this.data.activity_detail.clockinTimeEnd[timeidx]
        var record = res.data;
        for(var i in res.data){
            var regdate = res.data[i].regTime
            var regtime = regdate.getFullYear() + "/" + (regdate.getMonth()+1) + "/" + regdate.getDate() + " " + regdate.getHours() + ":" + regdate.getMinutes()
            if(regtime > beginTime && regtime < endTime) return false
        }
    return true;
    }
});