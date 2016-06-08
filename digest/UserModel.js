var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/digest');

// var db = mongoose.connection;
var userSchema = Schema({
  user_id: String,
  username: String,
  access_token: String,
  ref_token: String,
  settings: { tags: Array, time_limit: Number },
});

var User = mongoose.model('User', userSchema);

// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
module.exports = User;
