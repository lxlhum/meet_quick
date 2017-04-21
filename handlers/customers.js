'use strict';

var crypto = require('crypto');
var config = require('../profile.json');
var Customer = require(config.CustomerModel);


exports.loginface = (req, res, next) => {
    // res.render('login', { layout: "login", title: '米特学堂后台管理系统' });
    res.render('admin', { layout: "admin", title: '米特学堂后台管理系统' });
}

exports.customersList = (req, res, next) => {

    // Customer.Model.find({},  (err, response) =>{
    //     if (err) {
    //         console.log("Error:" + err);
    //         res.send('查询失败' + err);
    //     }
    //     else {
    //         // console.log("Res:" + response);
    //         res.render('customersList', {
    //             layout: "admin",
    //             title: '米特学堂后台管理系统',
    //             customersList:response
    //         });
    //     }
    // })
    var pageNum = req.query.page ? req.query.page : 1;
    var pageSize = 6;

    Customer.PageQuery(pageNum, pageSize, Customer.Model, "", {}, {}).then((pageResult) => {

        res.render('customersList', {
            layout: "admin",
            title: '米特学堂后台管理系统',
            customersList: pageResult.results,
            totalPages: pageResult.PageCount,
            pno: pageNum,
        });
    }).catch((err) => {
        console.log("查询失败:" + err);
        res.send("失败");
    });
}


var OAuth = require('wechat-oauth');
var client = new OAuth(config.appid, config.appsecret);

exports.myinfo = (req, res, next) => {
    var code = req.query.code;
    //获取票券
    client.getAccessToken(code, function (err, result) {
        // var openid = result.data.openid;
        // console.log("err:" + err);
        // console.log("code:" + code);

        // for (var key in result)
        //     console.log(key + " result:" + result[key]);

        // for (var key in result["data"])
        //     console.log(key + " result:" + result["data"][key]);

        var wherestr = { 'openid': result["data"]["openid"] };
        Customer.Model.findOne(wherestr, function (err, response) {
            if (err) {
                console.log("Error:" + err);
            }
            else {
                console.log("nickname:" + response["nickname"]);
                console.log("headimgurl:" + response.headimgurl);
                console.log("province:" + response.province);
                console.log("sex:" + response.sex);
                res.render('myinfo', {
                    layout: "wechat_web",
                    title: '米特学堂后台管理系统',
                    nickname:response.nickname,
                    headimgurl:response.headimgurl,
                    sex:response.sex==="1"?"男":"女",
                    province:response.province
                });

            }
        })


    });

}