var express = require('express');
var router = express.Router();
var api = require('instagram-node').instagram();

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
      console.log(err.body);
      res.send("Didn't work");
    } else {
      console.log('Yay! Access token is ' + result.access_token);
      res.send('You made it!!');
    }
  });
});

module.exports = router;
