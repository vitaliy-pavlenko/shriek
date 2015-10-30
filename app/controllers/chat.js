// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var mongoose = require('mongoose');
var session = require('express-session');
var path = require('path');
var sessionStore = require('../modules/sessionStore');
var config = require('../configs/config');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var port = process.env.PORT || config.get('port');
var routes = require('../routes');
app.set('port', port);

app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// passportjs
var passport = require('passport');

var domain = '';
switch (process.env.NODE_ENV) {
  case 'dev':
    domain = 'pw-dev.herokuapp.com';
    break;
  case 'production':
    domain = 'pw-master.herokuapp.com';
    break;
  default:
    domain = 'localhost:3000';
    break;
}

server.listen(app.get('port'), function () {
  mongoose.connect(process.env.MONGO_LINK || config.get('mongoose:uri'));
  var db = mongoose.connection;

  db.on('error', function (err) {
    console.error('Connection error:', err.message);
  });
  db.once('open', function callback() {
    console.info('Connected to DB!');
  });
});

// Routing
app.use(express.static('public'));
app.use('/components', express.static('app/components'));

app.use(session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: sessionStore,
  resave: true,
  saveUninitialized: false
}));

app.use('/', routes);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

var UserModel = require('../models/user');

passport.deserializeUser(function (id, done) {
  UserModel.findById(id, function (err, user) {
    done(err, user);
  });
});

// passports
require('../modules/passports/twitter')(app, domain);
require('../modules/passports/google')(app, domain);
require('../modules/passports/github')(app, domain);

var io = require('../socket')(server);
app.set('io-socket', io);
