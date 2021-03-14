let util = require('../../utils/util.js');
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
                let raw = res.data[0] || {};
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
        db.collection('clockinList').where({
                aid: aid,
                openid: this.data.openid,
                regTime: _.gte(new Date(new Date().setHours(0,0,0)))   //获取当天的报名单
            }).get()
            .then(
                res => {
                    setTimeout(() => {
                        if (this.clockinTimeJudge()) { //时间段校验 | 成功时
                            if (!this.clockinJudge(res)) { //再检查是否已经打过卡
                                this.setData({
                                    alreadyClockin: true,
                                    alreadyClockinText: "已经打过啦" //有机会可以改成完成打卡
                                })
                            } else {
                                this.setData({
                                    alreadyClockin: false,
                                    alreadyClockinText: "立即打卡"
                                })
                            }
                        } else { //这段时间不能打卡
                            this.setData({
                                alreadyClockin: true,
                                alreadyClockinText: "现在不能打哦"
                            })
                        }
                    }, 200);
                }
            );
        db.collection('collect').where({
            aid: aid,
            openid: this.data.openid,
            regTime: _.gte(new Date())
        }).get().then(res => {
            console.log('collect', res);
            if (res.data.length > 0) {
                this.setData({
                    isCollected: true
                });
            }
        });
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
            if (!this.clockinTimeJudge()) {
                wx.showToast({
                    title: '请在饭点打卡哦',
                    icon: 'error',
                    duration: 1500,
                });
            } else if (this.data.alreadyClockin === true) {
                wx.showToast({
                    title: '已经打过啦:)',
                    icon: 'error',
                    duration: 1500,
                });
            } else {
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
                        let url = '光盘行动/' + this.timeToString(now) + '.png'
                        wx.cloud.uploadFile({
                            // 指定上传到的云路径
                            cloudPath: url,
                            // 指定要上传的文件的小程序临时文件路径
                            filePath: chooseResult.tempFilePaths[0],
                            // 成功回调
                            success: res => {
                                console.log('上传成功', res)
                                db.collection('clockinList').add({
                                    data: {
                                        aid: acting._id,
                                        openid: that.data.openid,
                                        regTime: now,
                                        imgUrl: url,
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
                                        db.collection('clockinList').where({
                                            aid: acting._id,
                                            openid: that.data.openid
                                        }).count({
                                            success: function (res) {
                                                if (res.total == 1) {
                                                    console.log("restotal", that.data.activity_detail.regNum)
                                                    let wt = that.data.activity_detail.regNum + 1
                                                    db.collection('activity').where({
                                                        _id: acting._id
                                                    }).update({
                                                        data: {
                                                            regNum: wt
                                                        },
                                                        success: res => {
                                                            console.log(res)
                                                        },
                                                        fail: err => {
                                                            console.error('[数据库] [更新记录] 失败：', err)
                                                        }
                                                    })
                                                }
                                            }
                                        })
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
            }
        }
    },
    // 分享按钮
    onShareAppMessage(options) {
        let that = this;
        let form = this.data.activity_detail;
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
        let that = this;
        let form = this.data.activity_detail;
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
                icon: 'none'
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
                icon: 'none'
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
                    let that = this;
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
        let comment = this.data.comment_input;
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
        let that = this;
        let form = this.data.activity_detail;
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

    async onClickTypeActList(e) {
        let flag = await util.checkActivityType(e.currentTarget.dataset.id)
        wx.navigateTo({
            url: '../../packageA/' + flag,
        });
    },
    
    //定义将Date对象转换为字符串函数
    timeToString: function (timeObj) {
        let str = "";
        let year = timeObj.getFullYear();
        let month = timeObj.getMonth();
        let date = timeObj.getDate();
        let time = timeObj.toTimeString().split(" ")[0];
        let rex = new RegExp(/:/g);
        str = year + "-" + month + "-" + date + "-" + time.replace(rex, "-");
        return str;
    },

    // 打卡时间校验
    clockinTimeJudge: function () {
        let num = this.data.activity_detail.clockinTimeBegin.length; //有几组打卡时间
        let begin = this.data.activity_detail.clockinTimeBegin;
        let end = this.data.activity_detail.clockinTimeEnd;

        for(let i = 0 ; i < num; i++){
            if(this.compareNow(begin[i]) == 1 || this.compareNow(end[i]) == -1){
                console.log('时间段校验 | 不可以打卡')
                return false;
            }
        }
        console.log('时间段校验 | 可以打卡')
        return true;
    },

    // 是否已打卡
    clockinJudge: function (res) {
        let tick = res.data.length; //当天已经打了多少次卡了
        if(tick == 0) return true; //如果还未打卡  则直接返回true 表示可以打卡

        //检查此刻时间 是否还在用户上一次打卡的时间段里
        let end = this.data.activity_detail.clockinTimeEnd[tick-1];
        console.log("e",end)
        if(this.compareNow(end) == -1) {
            console.log("还没打过呢")
            return true;
        }

        console.log("已经打过卡拉")
        return false;
    },

    // 将'HH:MM'字符串时间与当下时间做比较  | 字符串时间较靠后则返回1；靠前返回-1；相等时返回0；
    compareNow:function (str) {
        let nowHour = new Date().getHours();
        let nowMinite = new Date().getMinutes();
        let originHour = parseInt(str.substr(0,2));
        let originMinite =  parseInt(str.substr(3,2));
        console.log('test',nowHour,originHour)
        console.log("此刻字符串时间",nowHour+':'+nowMinite)
        console.log("字符串时间",originHour+':'+originMinite)
        if(originHour > nowHour) {
            return 1;
        }else if(originHour < nowHour){
            return -1;
        }else{
            if(originMinite > nowMinite){
                return 1;
            }else if(originMinite < nowMinite){
                return -1;
            }else{
                return 0;
            }
        }
    }
});