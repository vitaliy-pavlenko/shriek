module.exports = function(req, res, next) {
  var io = req.app.get('io-socket');
  var sid = req.session.id;
  var connects = io.of('/').connected;

  req.session.destroy(function (err) {
    Object.keys(connects).map(function(socketId) {
      var socket = connects[socketId];
      if (socket.handshake.session.id == sid) {
        socket.disconnect();
      }
    });

    if (err) return next(err);
    res.end();
  });
};
