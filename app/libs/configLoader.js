var yaml = require('js-yaml');
var fs = require('fs');

var load = function (file) {
  var doc = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
  return doc;
};

module.exports = load;