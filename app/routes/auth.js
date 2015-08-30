var express = require('express');
var router = express.Router();

var passport = require('passport');

router.get('/login', function (req, res) {
  res.render('login', {message: req.flash('error')});
});

router.post('/login', passport.authenticate('login', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/signup', function (req, res) {
  res.render('signup', {message: req.flash('error')});
});

router.post('/signup', passport.authenticate('signup', {
  successRedirect: '/dashboard',
  failureRedirect: '/signup',
  failureFlash: true
}));

module.exports = router;
