var UserModel = require('../models/user');

var UserModule = function (socket, io) {

  var getOnline = function (namespace) {
    var _namespace = io.of(namespace);

    if (!_namespace) {
      return [];
    }

    var connected = _namespace.connected;
    var online = [];

    for (var id in connected) {
      var userName = connected[id].username;

      if (userName !== undefined) {
        online.push(userName);
      }
    }

    return online;
  };

  socket.on('login', function(data, callback) {
    callback(socket.handshake.user);
  });
  /**
   * Получение информации о пользователе
   * @param data
   * @param data.username Никнейм пользователя
   */
  socket.on('user info', function (data) {
    var out = {};

    if (socket.username === undefined) {
      out = {
        status: 'error',
        error_message: 'Пользователь должен войти'
      };

      return socket.emit('user info', out);
    }

    var username = data.username || socket.username;

    UserModel.findOne(
      {username: username},
      {salt: 0, hashedPassword: 0},
      function (err, doc) {
        if (!err && doc) {
          out = {
            status: 'ok',
            user: doc
          };
        } else {
          out = {
            status: 'error',
            error_message: 'Пользователь не найден'
          };
        }

        socket.emit('user info', out);
      }
    );
  });

  /**
   * Список пользователей
   */
  socket.on('user list', function () {
    if (socket.username === undefined) {
      return socket.emit('user list', {
        status: 'error',
        error_message: 'Пользователь должен войти'
      });
    }

    UserModel.find({
      username: {$ne: socket.username}
    }, {salt: 0, hashedPassword: 0}, function (err, docs) {
      var out = {};

      if (!err && docs) {
        var online = getOnline('/');

        docs = docs.map(function (user) {
          // Ловкое условие определения статуса пользователя
          var isOnline = online.indexOf(user.username) > -1;

          // Приводим user к нормальному объекту
          user = user.toObject();
          user.online = isOnline;

          return user;
        });

        out = {
          status: 'ok',
          users: docs
        };
      } else {
        out = {
          status: 'error',
          error_message: 'Пользователей не найдено'
        };
      }

      socket.emit('user list', out);
    });
  });

  /**
   * Update user information
   * @param data
   * @param data.username Username
   * @param data.setting Object:
   *        email
   *        image
   */
  socket.on('user update', function (data) {
    var out = {};

    if (socket.username === undefined) {
      return socket.emit('user update', {
        status: 'error',
        error_message: 'Пользователь должен войти'
      });
    }

    UserModel.findOneAndUpdate(
      {username: socket.username},
      {setting: data.setting}
    )
      .select('-salt -hashedPassword')
      .exec(function (err, user) {
        if (!err && user) {
          out.status = 'ok';
          out.user = user;
        } else {
          out.status = 'error';
          out.error_message = 'Пользователь не найден';
        }

        socket.emit('user update', out);
      }
    );

  });

  /**
   * when the client emits 'typing', we broadcast it to others
   */
  socket.on('user start typing', function () {
    var out = {};

    if (socket.username === undefined) {
      out.status = 'error';
      out.error_message = 'Пользователь должен войти';
    } else if (socket.typing) {
      out.status = 'error';
      out.error_message = 'Пользователь уже печатает';
    } else {
      socket.typing = true;
      out.status = 'ok';
      out.user = {
        username: socket.username
      };
    }

    if (out.status === 'ok') {
      socket.broadcast.emit('user start typing', out);
    } else {
      socket.emit('user start typing', out);
    }
  });

  /**
   * when the client emits 'stop typing', we broadcast it to others
   */
  socket.on('user stop typing', function () {
    var out = {};

    if (socket.typing === undefined && !socket.typing) {
      out.status = 'error';
      out.error_message = 'Пользователь должен начать печатать';
    } else {
      out.status = 'ok';
      out.user = {
        username: socket.username
      };
      socket.typing = false;
    }

    if (out.status === 'ok') {
      socket.broadcast.emit('user stop typing', out);
    } else {
      socket.emit('user stop typing', out);
    }
  });
};

module.exports = UserModule;
