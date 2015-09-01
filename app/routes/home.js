var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/dashboard');
    return;
  }
  res.redirect('/login');
});

router.get('/dashboard', function (req, res) {
  res.redirect('/demo');
});

router.get('/demo', function (req, res) {
  res.render('demo');
});

module.exports = router;
