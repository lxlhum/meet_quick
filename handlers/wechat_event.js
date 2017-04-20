const request = require('request');
const gm = require('gm').subClass({ imageMagick: true });
const fs = require('fs');
const config = require('../profile.json');
const api = require('../wechat/wechat_api.js');
const Customer = require(config.CustomerModel);
const Activity = require(config.ActivityModel);

exports.wechat_event = (req, res, next) => {

    console.log("消息判断和事件响应");

    var message = req.weixin;
    console.log(message);

    switch (message.MsgType) {
        case "text": {
            switch (message.Content) {
                // case "diaosi": {
                //     res.reply('hehe');
                // }; break;
                case "getUserList": {
                    (async () => {
                        let openids = await getFollower();
                        let alldatas = await getBatchGetUsers(openids);
                        await customer_create(alldatas);
                    })().then(() => {
                        res.reply('保存成功');
                    }).catch((err) => {
                        console.log(err);
                        res.reply('保存失败');
                    })
                }; break;
                case "qr": {

                    var qr_path = config.path_wechat + message.FromUserName + message.CreateTime + '.png';
                    var a_path = config.path_wechat + 'a.jpg';
                    var b_path = config.path_wechat + 'b.jpg';
                    var c_path = config.path_wechat + 'c.png';
                    var qr_path_out_resize = config.path_wechat + message.FromUserName + message.CreateTime + '_out1.png';
                    var qr_path_out = config.path_wechat + message.FromUserName + message.CreateTime + '_out2.png';
                    var media_id = "";
                    (async () => {
                        let tmpQRCodeURL = await getTmpQRCodeURL(message.FromUserName);
                        await downTmpQRCode(qr_path, tmpQRCodeURL);
                        await gmResize(qr_path, qr_path_out_resize);
                        await gmComposite(a_path, qr_path_out_resize, qr_path_out);
                        media_id = await douploadMedia(qr_path_out);
                    })().then(() => {
                        res.reply({
                            type: "image",
                            content: {
                                mediaId: media_id
                            }
                        });
                    }).catch((err) => {
                        console.log(err);
                        res.reply('获取二维码失败');
                    })
                }; break;
                // case "hehe": {
                //     res.reply({
                //         type: "music",
                //         content: {
                //             title: "来段音乐吧",
                //             description: "一无所有",
                //             musicUrl: "http://mp3.com/xx.mp3",
                //             hqMusicUrl: "http://mp3.com/xx.mp3",
                //             thumbMediaId: "thisThumbMediaId"
                //         }
                //     });
                // } break;
                default: {
                    res.reply([
                        {
                            title: '让脾气大的熊孩子合作，我有妙招！',
                            description: '家有“熊孩子”，脾气大！动不动就哼唧、哭闹、大喊大叫！动之以情晓之以理，连哄带骗的套路，越来越不管用！万能的朋友圈，请赐我一招，专治爱发脾气的熊孩子吧！',
                            picurl: 'http://mmbiz.qpic.cn/mmbiz_png/LKrT69fByt6vHvlEdhYVOTib8Nre4tuoHdICe57hiafyymdUicEARQKBcjuTmeEBnXibKCCzX5NbU7dsZdicWtOWerA/0?wx_fmt=gif&tp=webp&wxfrom=5&wx_lazy=1',
                            url: 'http://mp.weixin.qq.com/s/_bdZ8JokJY1u-vwa5CFpCw'
                        }
                    ]);
                }
            }
        }; break;
        case "event": {
            switch (message.Event) {
                case "subscribe": {
                    console.log(message);


                    (async () => {
                        //此处要取得两个数据
                        //openid 、头像信息、nikename
                        if (message.EventKey === "qrscene_0") {
                            let wherestr = { 'activity_ticket': message.Ticket };
                            let activityInfo = await getActivityInfo(wherestr);
                            console.log(activityInfo);
                            let recommenderInfo = await getOneUserInfo(activityInfo[0].open_id);
                            let commenderInfo = await getOneUserInfo(message.FromUserName);
                            let newCustomerUser = [];

                            commenderInfo.recommender_openid = recommenderInfo.openid;
                            commenderInfo.recommender_nickname = recommenderInfo.nickname;
                            commenderInfo.recommender_headimgurl = recommenderInfo.headimgurl;
                            newCustomerUser[0] = commenderInfo;
                            await customer_create(newCustomerUser);
                        } else {
                            let commenderInfo = await getOneUserInfo(message.FromUserName);
                            let newCustomerUser = [];
                            newCustomerUser[0] = commenderInfo;
                            await customer_create(newCustomerUser);
                        }

                        // for (key in recommenderInfo) {
                        //     console.log("recommenderInfo:" + key + ":" + recommenderInfo[key]); // { errcode: 0, errmsg: 'ok' }
                        // }
                    })().then(() => {
                        res.reply('欢迎关注米特学堂，这里有最棒的家庭教育资源，最耐心的心理学讲师，米特学堂融入心理学和教育学的精准体验式教学方法，寓教于乐，与您的孩子共同成长。');
                    }).catch((err) => {
                        console.log(err);
                        res.reply('欢迎欢迎');
                    })

                }; break;
                case "unsubscribe": {
                    res.reply('unsubscribe');
                }; break;
                case "SCAN": {
                    // res.reply('感谢您关注米特学院，么么哒，目前该功能还不完善，更多功能需要和彭老师一起定制哟' + message.EventKey);
                    try {
                        // res.redirect(301, 'http://www.yangtz.com/users/');
                        res.reply('感谢您关注米特学院，么么哒，目前该功能还不完善，更多功能需要和彭老师一起定制哟');
                    } catch (err) {
                        console.log(err);
                        res.reply('失败');
                    }

                }; break;

                case "VIEW": {
                    req.session.openid = message.FromUserName;
                    // message.EventKey=message.EventKey+"?openid="+message.FromUserName;
                    // console.log(message.EventKey);
                    res.reply('接收跳转事件');

                }; break;
                case "CLICK": {
                   var qr_path = config.path_wechat + message.FromUserName + message.CreateTime + '.png';
                    var a_path = config.path_wechat + 'a.jpg';
                    var b_path = config.path_wechat + 'b.jpg';
                    var c_path = config.path_wechat + 'c.png';
                    var qr_path_out_resize = config.path_wechat + message.FromUserName + message.CreateTime + '_out1.png';
                    var qr_path_out = config.path_wechat + message.FromUserName + message.CreateTime + '_out2.png';
                    var media_id = "";
                    (async () => {
                        let tmpQRCodeURL = await getTmpQRCodeURL(message.FromUserName);
                        await downTmpQRCode(qr_path, tmpQRCodeURL);
                        await gmResize(qr_path, qr_path_out_resize);
                        await gmComposite(a_path, qr_path_out_resize, qr_path_out);
                        media_id = await douploadMedia(qr_path_out);
                    })().then(() => {
                        res.reply({
                            type: "image",
                            content: {
                                mediaId: media_id
                            }
                        });
                    }).catch((err) => {
                        console.log(err);
                        res.reply('获取海报失败');
                    })

                }; break;

            }
        }; break;
    }
}

var getFollower = () => {
    return new Promise((resolve, reject) => {
        api.getFollowers((err, data, response) => {
            if (err) {
                console.log("获取关注用户数据失败:" + err);
                reject(err);
            }
            else {
                console.log("获取关注用户数据成功:");
                resolve(data.data.openid);
            }
        });
    });
};

var getOneUserInfo = (open_id) => {
    return new Promise((resolve, reject) => {
        api.getUser(open_id, (err, data, response) => {
            if (err) {
                console.log("获取关注用户数据失败:" + err);
                reject(err);
            }
            else {
                console.log("获取关注用户数据成功:");
                resolve(data);
            }
        });
    });
};

var getActivityInfo = (wherestr) => {
    return new Promise((resolve, reject) => {
        Activity.Model.find(wherestr, (err, response) => {
            if (err) {
                console.log("获取关注用户数据失败:" + err);
                reject(err);
            }
            else {
                console.log("获取关注用户数据成功:");
                resolve(response);
            }
        });
    });
};

var getBatchGetUsers = (openids) => {
    return new Promise((resolve, reject) => {
        api.batchGetUsers(openids, (err, data, responses) => {
            if (err) {
                console.log("批量获取数据失败:" + err);
                reject(err);
            }
            else {
                console.log("批量获取数据成功:");
                resolve(data["user_info_list"]);
            }
        });
    });
};

var customer_create = (alldatas) => {
    return new Promise((resolve, reject) => {
        Customer.Model.create(alldatas, (err, response) => {
            if (err) {
                console.log("保存失败:" + err);
                reject(err);
            }
            else {
                console.log("保存成功:" + response);
                resolve(true);
            }
        });
    });
}

var getTmpQRCodeURL = (open_id) => {
    return new Promise((resolve, reject) => {
        //此处需要增加活动管理
        //0：代表关注公众号
        //1：代表某课程
        //以此类推
        var qr_event_code = 0;
        var exist_time = 864000;
        api.createTmpQRCode(qr_event_code, exist_time, (err, data, response) => {
            if (err) {
                console.log("获取二维码信息失败:" + err);
                reject(err);
            }
            else {
                //先保存
                let activity = new Activity.Model({
                    activity_ticket: data.ticket,
                    qr_event_code: qr_event_code,
                    open_id: open_id,
                    qr_time: new Date(),
                    livetime: exist_time
                });

                activity.save((err, response) => {

                    if (err) {
                        console.log("保存失败" + err);
                        res.send('保存失败');
                    }
                    else {
                        console.log("Res:" + response);
                        let qucodemedia = api.showQRCodeURL(data.ticket);
                        console.log("showQRCodeURL:" + qucodemedia);
                        resolve(qucodemedia);
                    }
                });
            }
        });
    })
}

var downTmpQRCode = (qr_path, qucodemedia) => {
    return new Promise((resolve, reject) => {
        var fileWriteStream = fs.createWriteStream(qr_path);
        request(qucodemedia).pipe(fileWriteStream);
        fileWriteStream.on('close', (err) => {
            if (err) {
                console.log("图片下载失败:" + err);
                reject(err);
            }
            else {
                console.log('copy over');
                resolve("done");
            }
        });
    });
}

var gmResize = (qr_path, qr_path_out_resize) => {
    return new Promise((resolve, reject) => {
        gm(qr_path)
            .resize(164, 164)
            .noProfile()
            .write(qr_path_out_resize, (err) => {
                if (err) {
                    console.log("图片裁剪失败:" + err);
                    reject(err);
                }
                else {
                    console.log("图片裁剪成功");
                    resolve("done");
                }
            });
    })
}

var gmComposite = (a_path, qr_path_out_resize, qr_path_out) => {
    return new Promise((resolve, reject) => {
        gm(a_path)
            .composite(qr_path_out_resize)
            .geometry('+173+622')
            .write(qr_path_out, (err) => {
                if (err) {
                    console.log("图片合成失败:" + err);
                    reject(err);
                }
                else {
                    console.log("图片合成成功");
                    resolve("done");
                }
            });
    })
}

var douploadMedia = (qr_path_out) => {
    return new Promise((resolve, reject) => {
        api.uploadMedia(qr_path_out, "image", (err, result) => {
            if (err) {
                console.log("图片上传失败:" + err);
                reject(err);
            }
            else {
                console.log("图片上传成功:" + result.media_id);
                resolve(result.media_id);
            }
        });
    })
}