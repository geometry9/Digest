var express = require('express');
var router = express.Router();
var api = require('instagram-node').instagram();
var User = require('../UserModel');
var crypto =  require('crypto-js');
var passport = require('passport');
var UserAppStrategy = require('passport-userapp').Strategy;
var cors = require('cors');
var lodash = require('lodash');
var cookieParser = require('cookie-parser')


router.use(cors());
router.use(cookieParser());


passport.use(new UserAppStrategy({
        appId: '57c9a3a52ce8c'
    },
    function (userprofile, done) {
      return done(null, userprofile);
    }
));

router.post('/api/call', passport.authenticate('userapp'),
  function(req, res) {
    // Return some relevant data, for example the logged in user, articles, etc.
    res.send({ user: req.user });
  });

api.use({
  client_id: 	"04e0540640be4c6bbc9237420daae3df",
  client_secret: "c9747a61e388437580faa61bacc10b6f"
});

var redirect_uri = "http://local.digest.com:3000/handleauth";

/* GET home page. */
router.get('/logout', function(req, res, next) {
  res.render('index', { title: 'Instatool' });
});
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Instatool' });
});

router.get('/dashboard',
  function(req, res) {
    //check if user needs instagram link or not.
    api.use({
      client_id: 	"04e0540640be4c6bbc9237420daae3df",
      client_secret: "c9747a61e388437580faa61bacc10b6f",
    });
    res.render('dashboard', {
      title: 'Instatool',
      insta_auth_link: api.get_authorization_url(redirect_uri, { scope: ['likes', 'public_content', 'basic'] })
    });
});
router.post('/update_user_preferences', function(req, res){
  var token = req.body['token'] || req.cookies.digest
  var tags = (typeof req.body['tags[]'] !== "string" ) ? req.body['tags[]'] : [req.body['tags[]']];

  var mediasResponse = [];
  User.findOne({ 'ref_token': token }, function(err, user){
    if(user){
      api.use({
        client_id: 	"04e0540640be4c6bbc9237420daae3df",
        client_secret: "c9747a61e388437580faa61bacc10b6f",
        access_token: user.access_token || ''
      });
      for (var i = 0; i < tags.length; i++) {
        if(i === (tags.length - 1)){
          api.tag_media_recent(tags[i], function(err, medias, pagination, remaining, limit) {
            mediasResponse = lodash.concat(mediasResponse,medias);
            res.render('dashboard', { current_tag_likes: mediasResponse, insta_auth_link: '' });
          });
        }else{
          api.tag_media_recent(tags[i], function(err, medias, pagination, remaining, limit) {
            mediasResponse = lodash.concat(mediasResponse,medias);
          });
        }
      }
    }

  });

});

// This is where you would initially send users to authorize
router.get('/authorize_user', function(req, res) {
  res.redirect();
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
      var refToken = crypto.AES.encrypt(result.access_token, 'Castles in the snow');
      res.cookie('digest',refToken.toString(), { maxAge: 900000, httpOnly: true });

      //if user doesn't exist && ref_token;
      User.findOne({ user_id: result.user.id }, function (err, user){
          if (err) { return next(err); }

          if(user){
              user.ref_token = refToken;
              user.access_token = result.access_token;
              user.save(function(err) {
                if (err) { return next(err); }
                res.redirect('/dashboard?token=' + refToken);
              });
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
});

module.exports = router;
