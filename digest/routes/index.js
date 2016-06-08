var express = require('express');
var router = express.Router();
var api = require('instagram-node').instagram();
var User = require('../UserModel');



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
  res.redirect(api.get_authorization_url(redirect_uri, { scope: ['likes'], state: 'a state' }));
});
// This is your redirect URI
router.get('/handleauth', function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      console.log(err);
      console.log(err.body);
      res.send("There was a problem logging in.");
    } else {
      var refToken = '1234';
      //if user doesn't exist && ref_token;
      User.count({user_id: result.user.id}, function (err, count){
          if(count > 0){
              console.log('woah one user');
              res.redirect('/dashboard?u='+result.user.id);
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
              res.redirect('/dashboard?u='+result.user.id);
            });
          }
      });
    }
  });

  router.get('/dashboard', function(req, res) {
    var user = User.findOne({ 'user_id': req.query.u });
    res.cookie('ref_token', user.ref_token);
    res.render('tags_input', { userName: user.username });
  });
});

module.exports = router;
