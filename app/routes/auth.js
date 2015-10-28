var User = require('../models/user');

exports.get = function(req, res) {
  res.render('auth');
};

exports.post = function(req, res, next) {
  var login = req.body.login;
  var password = req.body.password;

  User.auth(login, password, function(err, user) {
    if (err) return next(err);

    req.session.user = user._id;
    res.end();
  });

};
