var crypto = require('crypto');
var config = require('../profile.json');
var User = require(config.UserModel);

exports.loginface = function (req, res, next) {
    // res.render('login', { layout: "login", title: '米特学堂后台管理系统' });
    res.render('admin', { layout: "admin", title: '米特学堂后台管理系统' });
}

exports.loginAction = function (req, res, next) {


    var username = req.body.username
    var password = req.body.password;

    var shaSum_username = crypto.createHash('md5');
    shaSum_username.update(username);
    var hashedUsername = shaSum_username.digest('hex');
    console.log(hashedUsername);
    var shaSum_password = crypto.createHash('md5');
    shaSum_password.update(password);
    var hashedPassword = shaSum_password.digest('hex');
    console.log(hashedPassword);
    User.Model.findOne({ "username": hashedUsername, "password": hashedPassword }, function (err, doc) {
        var exists = !!doc;
        if (exists) {

            console.log("Res:" + doc);
            req.session.username = hashedUsername;
            req.session.password = hashedPassword;

            res.send({ "success": true });
        }
        else {

            if (err) {
                console.log("Error:" + err);
                res.send({ "success": false, "Error": "系统错误" });
            }

            console.log("用户名或者密码错误" + err);
            res.send({ "success": false });
        }
    })

}

exports.tempAddUser = function (req, res, next) {

    var username = "meet_ac20110317_admin"
    var password = "Cx_20110317_acmeet";

    var shaSum_username = crypto.createHash('md5');
    shaSum_username.update(username);
    var hashedUsername = shaSum_username.digest('hex');
    console.log(hashedUsername);
    var shaSum_password = crypto.createHash('md5');
    shaSum_password.update(password);
    var hashedPassword = shaSum_password.digest('hex');
    console.log(hashedPassword);

    var user = new User.Model({
        username: hashedUsername,
        password: hashedPassword,
        lastlogintime: new Date()
    });
    user.save(function (err, response) {

        if (err) {
            console.log("保存失败" + err);
            res.send('保存失败');
        }
        else {
            console.log("Res:" + response);
            res.send('保存成功');
        }

    });

}