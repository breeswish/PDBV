var LocalStrategy = require('passport-local').Strategy;

var User = require('app/models/user');

var init = function () {

  return new LocalStrategy(function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      if (!user.isPasswordCorrect(password)) {
        return done(null, false, { message: 'Password is incorrect' });
      }
      return done(null, user);
    });
  });

};

module.exports = init;
