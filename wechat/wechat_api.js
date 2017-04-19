var API = require('wechat-api');
var config = require('../profile.json');

var api = new API(config.appid, config.appsecret);
api.getAccessToken(function (err, token) {
  console.log("getAccessToken-err:" + err);
  console.log("accessToken:" + token.accessToken);
  console.log("expireTime:" + token.expireTime);
});

module.exports = api;