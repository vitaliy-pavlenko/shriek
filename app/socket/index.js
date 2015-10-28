var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var config = require('../configs/config');
var sessionStore = require('../modules/sessionStore');
var async = require('async');
var User = require('../models/user');

module.exports = function(server) {
  var io = require('socket.io')(server);
  io.set('origins', 'localhost:*');
  io.use(function(socket, callback) {
    async.waterfall([
      function(callback) {
        var handshake = socket.request;
        var cookies  = cookie.parse(handshake.headers.cookie);
        var sid = cookieParser.signedCookie(cookies[config.get('session:key')], config.get('session:secret'));
        sessionStore.load(sid, function (err, session) {
          if (arguments.length == 0) {
            callback(null, null);
          } else {
            callback(null, session);
          }
        })
      },
      function(session, callback) {
        if (!session) {
          var error = {};
          error.status = 401;
          error.message = 'No session';
          callback(error);
        }
        socket.handshake.session = session;
        User.findById(session.user, function(err, user) {
          if (err) return callback(err);
          if (user) {
            socket.handshake.user = user;
            return callback(null);
          }
          var error = {};
          error.status = 401;
          error.message = 'Invalid user';
          callback(error);
        });
      }
    ], function(err) {
      callback(err);
    });
  });

  io.on('connection', function(socket) {
    var user = socket.handshake.session.user;
    require('../modules/user')(socket, io);
    require('../modules/message')(socket);
    require('../modules/channel')(socket);
    require('../modules/search')(socket);
    socket.on('disconnect', function() {
      socket.broadcast.emit('user disconnected', {
        status: 'ok',
        user: {
          username: socket.username
        }
      });
    });
  });

  return io;
};

