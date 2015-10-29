var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if (!req.session.user) {
    return res.redirect('auth');
  }
  res.render('index');
});

router.route('/auth')
  .get(require('./auth').get)
  .post(require('./auth').post);

router.post('/logout', require('./logout'));
module.exports = router;
