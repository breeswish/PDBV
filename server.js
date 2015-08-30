// Config
var config = require('app/libs/configLoader')('config.yaml');

// Database
var mongoose = require('mongoose');
mongoose.connect(config.database.url);
mongoose.connection.on('error', function () {
  console.error('MongoDB connect failed!');
});

// Passport
require('app/libs/auth')();

// Server
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');

var path = require('path');
var swig = require('swig');
var passport = require('passport');
var stylus = require('stylus');
var autoprefixer = require('autoprefixer-stylus');

var app = express();

// Template
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', false);
swig.setDefaults({ cache: false });

// Other express configuration
app.set('port', process.env.PORT || 3000);
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.secret,
  store: new MongoStore({ url: config.database.url, autoReconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});

// static
app.use(stylus.middleware({
  src: path.join(__dirname, 'public'),
  compile: function (str, path) {
    return stylus(str)
      .use(autoprefixer())    // autoprefixer
      .set('filename', path)  // @import
      .set('compress', true); // compress
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

// Router
app.use(require('app/routes'));

// Error handler
app.use(errorHandler());

// Start
app.listen(app.get('port'), function () {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});
