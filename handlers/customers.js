var crypto = require('crypto');
var config = require('../profile.json');
// var User = require(config.models_factary)("user");


exports.loginface = function (req, res, next) {
    // res.render('login', { layout: "login", title: '米特学堂后台管理系统' });
    res.render('admin', { layout: "admin", title: '米特学堂后台管理系统' });
}

exports.customersList = function (req, res, next) {
    
    res.render('customersList', { layout: "admin", title: '米特学堂后台管理系统' });
}