/*global Promise */

var File = require('app/models/file');

var path = require('path');
var fs = require('fs');

var libStructure = {};

libStructure.listFiles = function () {
  return File.find().sort([['at', 'descending']]).exec().then(function (files) {
    return files.map(function (file) {
      return {
        filename: file.filename,
        title: file.title,
        at: file.at.getTime(),
        _id: file._id,
      };
    });
  });
};

libStructure.addFile = function (uid, title, filename) {
  return new Promise(function (resolve, reject) {
    var file = new File({
      filename: filename,
      uid: uid,
      title: title
    });
    file.save(function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

libStructure.deleteFile = function (id) {
  return new Promise(function (resolve, reject) {
    File.findById(id, function (err, file) {
      if (err) {
        reject(err);
        return;
      }
      if (file === null) {
        reject(new Error('File not exist'));
        return;
      }
      file.remove().then(function () {
        resolve(file);
      });
    });
  });
};

module.exports = libStructure;
