var express = require('express');
var router = express.Router();

var authUtil = require('app/libs/auth/util');
var libRoom = require('app/libs/room');

router.get('/', authUtil.isAuthenticated, function (req, res) {
  res.render('index');
});

module.exports = router;
