var passport = require('passport');

var User = require('app/models/user');

var init = function () {

  passport.use('login', require('app/libs/auth/login')());
  passport.use('signup', require('app/libs/auth/signup')());

  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

};

module.exports = init;
