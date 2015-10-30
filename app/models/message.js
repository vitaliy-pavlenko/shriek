var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Message = new Schema({
  username: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  raw: {
    type: String
  },
  type: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: "http://media.steampowered.com/steamcommunity/public/images/avatars/78/78acf20c6efa57fcadad137ff7ababb6f8210305_full.jpg"
  },
  attachments: {}
});

module.exports = mongoose.model('Message', Message);
