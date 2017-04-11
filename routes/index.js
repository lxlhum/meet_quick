var express = require('express');
var router = express.Router();
var wechat = require('wechat');
var api = require('../wechat/wechat_api.js');
var config = require('../profile.json');
var fs = require('fs');

var request = require('request');

var gm = require('gm').subClass({ imageMagick: true });

var menu = JSON.stringify(require('../menu.json'));
api.createMenu(menu, function (err, result) { });

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

var Customer = require(config.models_factary)("customer");

router.get('/meetconfig', wechat(config, function (req, res, next) { }));
router.post('/meetconfig', wechat(config, function (req, res, next) {

  console.log("消息判断和事件响应");

  var message = req.weixin;
  console.log(message);

  switch (message.MsgType) {
    case "text": {
      if (message.Content === 'diaosi') {
        res.reply('hehe');
      } else if (message.Content === 'getUserList') {
        api.getFollowers(function (err, data, response) {
          console.log("err is:" + err);
          var openids = data.data.openid;
          api.batchGetUsers(openids, function (err, data, responses) {

            var datas = data["user_info_list"];
            for (var i in datas) {
              // console.log("i is:" + i);
              // console.log("data is:" + data[i]);
              var infos = datas[i];
              var customer = new Customer(infos);
              customer.save(function (err, response) {

                if (err) {
                  console.log("保存失败" + err);
                  res.reply('保存失败');
                }
                else {
                  console.log("Res:" + response);
                  res.reply('保存成功');
                }

              });
              // for (var f in infos) {
              //   console.log(f + " _is:" + infos[f]);


              //   // subscribe _is: 1
              //   // openid _is: oyjl4wvwlZ82blfpsVikQG8EeM0c
              //   // nickname _is: 彭敏
              //   // sex _is: 2
              //   // language _is: zh_CN
              //   // city _is: 东城
              //   // province _is: 北京
              //   // country _is: 中国
              //   // headimgurl _is: http://wx.qlogo.cn/mmopen/Q3auHgzwzM7iay4jUamtajO2Sr2fdtRwY9lhib4LGdOTSmSepuV5hA86bAolgiaiajhZe61zbOQ0yG2JhJGbX4JKXg/0
              //   // subscribe_time _is: 1489623821
              //   // remark _is:
              //   // groupid _is: 0
              //   // tagid_list _is:

              // }

            }
          });

          // expect(err).not.to.be.ok();
          // expect(data).to.only.have.keys('total', 'count', 'data', 'next_openid');
          // done();
          // res.reply('done');
        });
      }
      else if (message.Content === 'qr') {
        api.createTmpQRCode("x", 100, function (err, data, response) {
          console.log(data);
          var path_wechat = "/home/userp/meet_quick/wechat/wechat_temp_qr/";
          var qucodemedia = api.showQRCodeURL(data.ticket);
          console.log("showQRCodeURL:" + qucodemedia);
          var qr_path = path_wechat + message.FromUserName + message.CreateTime + '.png';
          var a_path = path_wechat + 'a.jpg';
          var b_path = path_wechat + 'b.jpg';
          var c_path = path_wechat + 'c.png';
          var qr_path_out_resize = path_wechat + message.FromUserName + message.CreateTime + '_out1.png';
          var qr_path_out = path_wechat + message.FromUserName + message.CreateTime + '_out2.png';

          //测试用
          // var fileReadStream = fs.createReadStream(a_path);

          var fileWriteStream = fs.createWriteStream(qr_path);
          console.log("qr_path:" + qr_path);
          request(qucodemedia).pipe(fileWriteStream);
          // fileReadStream.pipe(fileWriteStream);
          fileWriteStream.on('close', function () {
            console.log('copy over');


            gm(qr_path)
              .resize(126, 126)
              .noProfile()
              .write(qr_path_out_resize, function (err) {
                if (!err) console.log('done');


                gm(a_path)
                  .composite(qr_path_out_resize)
                  .geometry('+130+67')
                  .write(qr_path_out, function (err) {
                    if (!err) console.log("Written composite image.");

                    api.uploadMedia(qr_path_out, "image", function (err, result) {

                      // gm(a_path)
                      //   .resize(480, 240)
                      //   .noProfile()
                      //   .write(qr_path_out, function (err) {
                      //     console.log(err);
                      //     if (!err) console.log('done');
                      //   });

                      // gm(a_path)
                      //   .composite(b_path)
                      //   .geometry('+100+150')
                      //   .write(qr_path_out, function (err) {
                      //     if (!err) console.log("Written composite image.");
                      //   });

                      console.log("result:" + result);
                      console.log("err:" + err);
                      res.reply({
                        type: "image",
                        content: {
                          mediaId: result.media_id
                        }
                      });
                    });
                  });
              });
          });
        });
      }
      else if (message.Content === 'hehe') {
        // 回复音乐
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
      }
      else {
        //图文回复
        res.reply([
          {
            title: 'meet_test_shell',
            description: 'meet_test_shell',
            picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
            url: 'http://www.yangtz.com'
          }
        ]);
      }
    }; break;
    case "event": {
      switch (message.Event) {
        case "subscribe": {
          res.reply('subscribe');
          api.getUser(message.FromUserName, function (err, data, res) {
            for (key in data) {
              console.log(key + ":" + data[key]); // { errcode: 0, errmsg: 'ok' }
            }
          });
        }; break;
        case "unsubscribe": {
          res.reply('unsubscribe');
        }; break;
        case "SCAN": {
          res.reply('感谢您关注米特学院，么么哒，目前该功能还不完善，更多功能需要和彭老师一起定制哟' + message.EventKey);
        }; break;
      }
    }; break;
  }
}));

module.exports = router;
