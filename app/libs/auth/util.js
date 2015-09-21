/*global Promise */

var mongoose = require('mongoose');
var User = require('app/models/user');

var util = {
  isAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  },

  resolveUsers: function (users) {
    if (users === null) {
      return Promise.resolve([]);
    }
    var userIds = users.map(function (userId) {
      return mongoose.Types.ObjectId(userId);
    });
    return User.find({_id: {$in: userIds}}).exec();
  },
};

module.exports = util;
