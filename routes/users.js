var express = require('express');
var config = require('../profile.json');
var router = express.Router();

// var Accounts = require(config.models_factary)("account");
var main = require(config.main_mp2);
var login = require(config.login_mp);
var customer = require(config.customer_mp);

router.get('/', main.authorize_session_only_username, login.loginface);
router.post('/login:id', login.loginAction);

router.get('/admin', main.authorize_session_only_username, (req, res, next) => {
  res.render('admin', { layout: "admin", title: 'Express' });

});

router.get('/putuser', login.tempAddUser);
router.get('/customersList', customer.customersList);



// router.get('/getuser',  (req, res, next) =>{
//   Accounts.find( (err, response) =>{
//     if (err) {
//       console.log("查询失败" + err);
//     }
//     else {
//       console.log("Res:" + response);
//       res.send('查询成功' + response);
//     }

//   });

// });

module.exports = router;
