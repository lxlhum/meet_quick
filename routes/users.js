var express = require('express');
var config = require('../profile.json');
var router = express.Router();

var Accounts = require(config.models_factary)("account");
var main = require(config.main_mp2);
var login = require(config.login_mp);

router.get('/', main.authorize_session_only_username, login.loginface);
router.post('/login:id', login.loginAction);

router.get('/admin', main.authorize_session_only_username, function (req, res, next) {
  res.render('admin', { layout: "admin", title: 'Express' });

});

router.get('/putuser', function (req, res, next) {

  res.send("test");


});


router.get('/getuser', function (req, res, next) {
  Accounts.find(function (err, response) {
    if (err) {
      console.log("查询失败" + err);
    }
    else {
      console.log("Res:" + response);
      res.send('查询成功' + response);
    }

  });

});

module.exports = router;
