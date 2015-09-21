var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var fileSchema = mongoose.Schema({
  filename: String,
  uid: mongoose.Schema.Types.ObjectId,
  at: { type: Date, default: Date.now },
  title: String,
});

module.exports = mongoose.model('File', fileSchema);
