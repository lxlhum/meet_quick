var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  
  res.render('login', { layout:"/layouts/login",title: 'Express' });

});

router.get('/admin', function(req, res, next) {
  
  res.render('admin', { layout:"/layouts/admin",title: 'Express' });

});


module.exports = router;
