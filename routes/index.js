const express = require('express');
const router = express.Router();
const wechat = require('wechat');
const api = require('../wechat/wechat_api.js');
const config = require('../profile.json');
const wechat_event = require(config.wechat_event);

const menu = JSON.stringify(require('../menu.json'));
api.createMenu(menu, function(err, result){
  console.log("菜单初始化完成"+result);
  console.log("err"+err);
 });

router.get('/', (req, res, next) => {

  // var OAuth = require('wechat-oauth');
  // var client = new OAuth(config.appid, config.appsecret);

  // var url = client.getAuthorizeURL('http://www.yangtz.com/users/myinfo/', 'hehe', 'snsapi_userinfo');
  // console.log(url);

  res.render('index', { title: 'Express' });
});

router.get('/meetconfig', wechat(config, (req, res, next) => { }));
router.post('/meetconfig', wechat(config, wechat_event.wechat_event));

module.exports = router;