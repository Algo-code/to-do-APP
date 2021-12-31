const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const MONGODB_URI = 'mongodb+srv://algo:algo@cluster0.g6kzb.mongodb.net/Todo-app';

const InitiateMongoServer = require("./config/db")

const User = require('./models/user');

const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const todoRouter = require('./routes/todo');


InitiateMongoServer();

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static('public'))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'bsBh9m67jksH87NvPlra401nsKXBS',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if(!req.session.user){
    console.log('no user found');
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    console.log('user found');
    req.user = user;
    next();
  }).catch(err => console.log(err));
});

app.use((req, res, next) => {
  console.log('locals reached');
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})


//app.use('/user', userRouter);
app.use(authRouter);
app.use(todoRouter);

//app.use('/', todoRouter);

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
