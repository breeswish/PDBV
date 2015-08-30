var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
    return;
  }
  res.redirect('/login');
});

module.exports = router;
