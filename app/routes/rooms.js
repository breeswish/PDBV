/*global GLOBAL */

var express = require('express');
var router = express.Router();

var authUtil = require('app/libs/auth/util');
var libRoom = require('app/libs/room');

router.get('/rooms/list', authUtil.isAuthenticated, function (req, res) {
  var rooms = libRoom.listAll();
  res.json({
    ok: true,
    rooms: rooms
  });
});

router.get('/rooms/create', authUtil.isAuthenticated, function (req, res) {
  var id = libRoom.create();
  res.json({
    ok: true,
    id: id
  });
});

module.exports = router;
