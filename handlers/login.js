var crypto = require('crypto');
var config = require('../profile.json');
var User = require(config.models_factary)("user");


exports.loginface = function (req, res, next) {
    res.render('login', { layout: "login", title: '米特学堂后台管理系统' });
}

exports.loginAction = function (req, res, next) {
    res.render('login', { layout: "login", title: '米特学堂后台管理系统' });
}

exports.tempAddUser = function (req, res, next) {
    
    var username = "meet_ac20110317_admin"
    var password = "Cx_20110317_acmeet";
    var shaSum = crypto.createHash('sha256');
    shaSum.update(password);

    

    // var user = new User({
    //     username: 'meet_cdfff',
    //     password: 'fghjj'
    // });
    // user.save(function (err, response) {

    //     if (err) {
    //         console.log("保存失败" + err);
    //     }
    //     else {
    //         console.log("Res:" + response);
    //         res.send('保存成功');
    //     }

    // });

}