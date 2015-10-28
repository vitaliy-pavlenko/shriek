var mongoose = require('mongoose');
var crypto = require('crypto');
var async = require('async');

var Schema = mongoose.Schema;

var User = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  hashedPassword: {
    type: String,
    required: false
  },
  salt: {
    type: String,
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  setting: {
    email: {
      type: String
    },
    image: {
      type: String,
      default: "http://media.steampowered.com/steamcommunity/public/images/avatars/78/78acf20c6efa57fcadad137ff7ababb6f8210305_full.jpg"
    },
    first_name: {
      type: String
    },
    last_name: {
      type: String
    },
    sex: {
      type: String,
      enum: ['female', 'male']
    },
    description: {
      type: String
    }
  }
});

User.methods.encryptPassword = function (password) {
  return crypto.Hmac('sha1', this.salt).update(password).digest('hex');
};

User
  .virtual('userId')
  .get(function () {
    return this.id;
  });

User
  .virtual('password')
  .set(function (password) {
    this._plainPassword = password;
    this.salt = crypto.randomBytes(32).toString('hex');
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._plainPassword;
  });

User.methods.checkPassport = function (password) {
  if(!this.hashedPassword) {
    this.set('password', password);
    this.save();
  };
};

User.methods.checkPassword = function (password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

User.methods.checkHashedPassword = function (hashedPassword) {
  return hashedPassword === this.hashedPassword;
};

User.path('username').validate(function (v) {
  return v.length > 4 && v.length < 30 && !/[^a-z_\w]+/i.test(v)
}, 'Никнейм не прошел валидацию');

User.path('hashedPassword').validate(function (v) {
  if (this._plainPassword) {
    if (this._plainPassword.length < 6) {
      this.invalidate('password', 'password must be at least 6 characters.');
    }
  }

  // if (this.isNew && !this._plainPassword) {
  //   this.invalidate('password', 'required');
  // }
}, null);

User
  .virtual('full_name')
  .set(function (full_name) {
    var arr_name = full_name.split(' ');
    this.first_name = arr_name[0];
    this.last_name = arr_name[1];
  })
  .get(function () {
    return [this.first_name, this.last_name].join(' ');
  });

User.statics.auth = function (login, password, callback) {
  var User = this;
  async.waterfall([
    function(callback) {
      User.findOne({username: login}, callback);
    },
    function(user, callback) {
      if (user) {
        if (user.checkPassword(password)) {
          callback(null, user);
        } else {
          var error = {};
          error.status = 401;
          error.message = 'Wrong password';
          callback(error);
        }
      } else {
        var newUser = new User({username: login, password: password});
        newUser.save(function(err) {
          if (err) return callback(err);
          callback(null, newUser);
        });
      }
    }
  ], callback);
};

module.exports = mongoose.model('User', User);
