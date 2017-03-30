var express = require('express');
var config = require('../profile.json');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('login', { layout: "login", title: '米特学堂后台管理系统' });
});

router.post('/login:id', function (req, res, next) {
  // res.render('login', { layout:"login",title: '米特学堂后台管理系统' });
  var mongoose = require('mongoose');
  mongoose.connect(config.db_conection);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    // we're connected!
    console.log("Connected correctly to server");
    var adminSchemaModel = require("../schema/admin.json");
    var adminSchema = mongoose.Schema(adminSchemaModel);
    var AdminModel = mongoose.model('admin', adminSchema);
    var insertuser = new AdminModel({ "username": "meet_hset", "password": "hstd_adbic" });
    insertuser.save(function (err, insertuser) {
      if (err) return console.error(err);
      console.error("更新完成：" + insertuser);
      AdminModel.find(function (err, insertuser) {
        if (err) return console.error(err);
        console.log(insertuser);
        db.close();
        res.send("更新完成");
      })
    });

  });



});

router.get('/admin', function (req, res, next) {
  res.render('admin', { layout: "admin", title: 'Express' });

});


module.exports = router;
