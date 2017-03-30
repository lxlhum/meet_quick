var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:id', function(req, res, next) {
  res.render('login', { layout:"login",title: '米特学堂后台管理系统' });
});

router.get('/admin', function(req, res, next) {
  res.render('admin', { layout:"admin",title: 'Express' });
});


module.exports = router;
