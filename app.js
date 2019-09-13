var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts');
const flash = require(`connect-flash`);
const session = require(`express-session`);
const passport = require(`passport`);

//For productions modules
const compression = require(`compression`);
const helmet = require(`helmet`);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//Connect to Mongo Database
require(`./config/mongoConfig`)();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
app.use(helmet());

//Express Session Middleware
app.use(session({
  secret: 'A',
  resave: true,
  saveUninitialized: true,
}));

//Flash Middleware
app.use(flash());

//Success and Error Flashes
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash(`success`);
  res.locals.error_msg = req.flash(`error`);
  res.locals.error = req.flash(`error_msg`);
  next();
});

//Passport and Config Middleware insert after express-session 
app.use(passport.initialize());
app.use(passport.session());
require(`./config/passportConfig`)(passport);

//Route handlers
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
