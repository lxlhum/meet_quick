const express = require('express');
const router = express.Router();
const wechat = require('wechat');
const api = require('../wechat/wechat_api.js');
const config = require('../profile.json');
const wechat_event = require(config.wechat_event);

const menu = JSON.stringify(require('../menu.json'));
api.createMenu(menu, (err, result) => { });

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.get('/meetconfig', wechat(config, (req, res, next) => { }));
router.post('/meetconfig', wechat(config, wechat_event.wechat_event));

module.exports = router;