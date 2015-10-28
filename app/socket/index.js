var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var config = require('../configs/config');
var sessionStore = require('../modules/sessionStore');

module.exports = function(server) {
  var io = require('socket.io')(server);
  io.set('origins', 'localhost:*');
  var chat = io.of('/chat');
  chat.use(function(socket, callback) {
    var handshake = socket.request;
    var cookies  = cookie.parse(handshake.headers.cookie);
    var sid = cookieParser.signedCookie(cookies[config.get('session:key')], config.get('session:secret'));
    var session = new Promise(function(resolve, reject) {
        sessionStore.load(sid, function (err, session) {
          if (err) reject(null, null);
          resolve(session);
        })
      }
    );
    session
      .then(function(data) {
        socket.handshake.session = data;
        return callback(null, data);
      })
      .catch(function(err) {
        return callback(err);
      });
  });

  chat.on('connection', function(socket) {
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

};

