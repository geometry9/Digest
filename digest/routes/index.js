var express = require('express');
var router = express.Router();
var api = require('instagram-node').instagram();
var User = require('../UserModel');
var crypto =  require('crypto-js');

api.use({
  client_id: 	"04e0540640be4c6bbc9237420daae3df",
  client_secret: "c9747a61e388437580faa61bacc10b6f"
});

var redirect_uri = "http://local.digest.com:3000/handleauth";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Instatool' });
});

// This is where you would initially send users to authorize
router.get('/authorize_user', function(req, res) {
  res.redirect(api.get_authorization_url(redirect_uri, { scope: ['likes', 'public_content', 'basic'] }));
});
// This is your redirect URI
router.get('/handleauth', function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err);
      console.log(err.body);
      res.send("There was a problem logging in.");
    } else {
      api.use({
        client_id: 	"04e0540640be4c6bbc9237420daae3df",
        client_secret: "c9747a61e388437580faa61bacc10b6f",
        access_token: result.access_token
      });
      var refToken = crypto.AES.encrypt(result.access_token, 'Castles in the snow');;
      //if user doesn't exist && ref_token;
      User.count({ user_id: result.user.id }, function (err, count){
          if(count > 0){
              res.redirect('/dashboard?token=' + refToken);
          }else{
            //create a new user
            console.log('Saving user...');
            var newUser = User({
              user_id: result.user.id,
              username: result.user.username,
              access_token: result.access_token,
              ref_token: refToken,
              settings: { tags: [], time_limit: 0 },
            });
            // save the user
            newUser.save(function(err) {
              if (err) throw err;
              res.redirect('/dashboard?token=' + refToken);
            });
          }
      });
    }
  });

  router.post('/update_user_preferences', function(req, res){
    var decrypt = crypto.AES.decrypt(req.cookies.ref_token.toString(), 'Castles in the snow');
    var plaintext = decrypt.toString(crypto.enc.Utf8);
    User.update({access_token: plaintext}, {
      settings: {
        tags: [req.body.user_tags],
        time_limit: req.body.user_time_between_likes
      }
    }, function(){
      res.redirect('/dashboard');
    });
  });

  router.get('/spawn', function(req, res){
    var token = req.cookies.ref_token;
    var decrypt = crypto.AES.decrypt(token, 'Castles in the snow');
    var plaintext = decrypt.toString(crypto.enc.Utf8);
    User.findOne({ 'ref_token': plaintext }, function(err, user){
      api.tag_media_recent(user.settings.tags[0], function(err, medias, pagination, remaining, limit) {
        res.render('bot_likes', { current_tag_likes: medias });
      });
    });


  });

  router.get('/stop', function(req, res){

  });

  router.post('/update_user_preferences', function(req, res){
    User.update({username: '_slaughterhome'}, {
      settings: {
        tags: [req.body.user_tags],
        time_limit: req.body.user_time_between_likes
      }
    }, function(){
      res.redirect('/dashboard');
    });
  });

  router.get('/dashboard', function(req, res) {
    var token = req.query.token;
    res.cookie('ref_token', token);
    var encrypted = crypto.AES.encrypt(token, 'Castles in the snow').toString();
    User.findOne({ 'access_token': encrypted }, function(err, user){
      if (err) throw err;
      api.user_self_liked({count: 15}, function(err, medias, pagination, remaining, limit) {
        if(user)
          res.render('tags_input', { userName: user.username, recent_tags: medias });
        else {
          res.render('tags_input', { userName: 'ANON', recent_tags: medias });
        }
      });
    });

  });
});

module.exports = router;
