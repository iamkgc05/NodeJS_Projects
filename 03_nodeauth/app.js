var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');
var multer = require('multer');
var flash = require('connect-flash');

const { check, validationResult } = require('express-validator');

var app = express(); // Déplacer cette ligne ici

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(check());

var mongo = require('mongodb');
var mongoose = require('mongoose');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// FileUpload handle
app.use( multer({dest: './uploads'}).single('profileimage'));
//var upload = multer({ dest: './uploads' })

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Handle session
app.use(session({
	secret: 'sonic',
	saveUninitialized: true,
	resave: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use((req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => {
      const namespace = error.param.split('.');
      const root = namespace.shift();
      const formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }

      return {
        param: formParam,
        msg: error.msg,
        value: error.value,
      };
    });

    return res.status(422).json({ errors: formattedErrors });
  }
  next();
});

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(function(req, res, next){
	res.locals.messages = require('express-messages')(req,res);
	next();
});

app.get('*', function(req, res, next){
	res.locals.user = req.user || null;
	next();
});
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;