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
                case "diaosi": {
                    res.reply('hehe');
                }; break;
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
                case "hehe": {
                    res.reply({
                        type: "music",
                        content: {
                            title: "来段音乐吧",
                            description: "一无所有",
                            musicUrl: "http://mp3.com/xx.mp3",
                            hqMusicUrl: "http://mp3.com/xx.mp3",
                            thumbMediaId: "thisThumbMediaId"
                        }
                    });
                } break;
                default: {
                    res.reply([
                        {
                            title: 'meet_test_shell',
                            description: 'meet_test_shell',
                            picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
                            url: 'http://www.yangtz.com'
                        }
                    ]);
                }
            }
        }; break;
        case "event": {
            switch (message.Event) {
                case "subscribe": {
                    console.log(message);
                    var recommender = {};
                    if (message.EventKey === "qrscene_0") {
                        (async () => {
                            //此处要取得两个数据
                            //openid 、头像信息、nikename
                            let wherestr = { 'activity_ticket': message.Ticket };
                            let activityInfo = await getActivityInfo(wherestr);
                            console.log(activityInfo);
                            let recommenderInfo = await getOneUserInfo(activityInfo[0].open_id);
                            for (key in recommenderInfo) {
                                console.log("recommenderInfo:"+key + ":" + data[key]); // { errcode: 0, errmsg: 'ok' }
                            }
                        })().then(() => {
                            api.getUser(message.FromUserName, (err, data, response) => {
                                for (key in data) {
                                    console.log(key + ":" + data[key]); // { errcode: 0, errmsg: 'ok' }
                                }
                                res.reply('成功关注');
                            });
                        }).catch((err) => {
                            console.log(err);
                            res.reply('欢迎欢迎');
                        })


                    }

                }; break;
                case "unsubscribe": {
                    res.reply('unsubscribe');
                }; break;
                case "SCAN": {
                    // res.reply('感谢您关注米特学院，么么哒，目前该功能还不完善，更多功能需要和彭老师一起定制哟' + message.EventKey);
                    res.redirect(303, '/users');
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
                // console.log("保存成功:" + response);
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
        var exist_time = 600;
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
            .resize(126, 126)
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
            .geometry('+130+67')
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