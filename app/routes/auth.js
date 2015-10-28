exports.get = function(req, res) {
  res.render('auth');
};

exports.post = function(req, res, next) {
  var login = req.body.login;
  var password = req.body.password;
  //@todo User.auth
};
