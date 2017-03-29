var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  
  res.render('login', { layout:"/layouts/login",title: 'Express' });

});

module.exports = router;
