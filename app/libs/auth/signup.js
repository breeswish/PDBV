var LocalStrategy = require('passport-local').Strategy;

var User = require('app/models/user');

var init = function () {

  return new LocalStrategy(function (username, password, done) {
    process.nextTick(function () {
      User.findOne({ username: username }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (user) {
          // already exists
          return done(null, false, { message: 'User already exists' });
        }

        var newUser = new User();
        newUser.username = username;
        newUser.password = newUser.hashPassword(password);

        // save the user
        newUser.save(function (err) {
          if (err) {
            return done(err);
          }
          return done(null, newUser);
        });
      });
    });
  });

};

module.exports = init;
