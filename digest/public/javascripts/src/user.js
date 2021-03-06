import Cookies from 'cookies-js';

var signup = UserApp.User.save({
    "first_name": "Timothy",
    "email": "timothy.johansson@userapp.io",
    "login": "timothy",
    "password": "v3rYsecre7!",
    "properties": {
        "age": {
            "value": 24,
            "override": true
        }
    },
    "subscription": {
        "price_list_id": "qcRTCZiKajkbl-kNATL1vk",
        "plan_id": "j5V9j7jBdJuCEMkBXseLfm",
        "override": false
    }
}, function(error, result){
    // Handle error/result
});

var login = UserApp.User.login({ "login": "timothy", "password": "v3rYsecre7!" }, function(error, result) {
    if (error) {
        // Something went wrong...
        // Check error.name. Might just be a wrong password?
    } else if (result.locks && result.locks.length > 0) {
        // This user is locked
    } else {
        // User is logged in, save result.token in a cookie called 'ua_session_token'
    }
});

var logout = UserApp.User.logout(function(error, result){
    // Clear cookie, redirect to login page, etc.
});

var token = Cookies.get("ua_session_token");
var getCookie =  function () {
   if (token) {
      // Yes, there is
      UserApp.setToken(token);

      // Get the logged in user
      UserApp.User.get({ user_id: "self" }, function(error, user) {
          if (error) {
              // The token has probably expired, go to the login page
              window.location.href = "/";
          } else {
              // Success, the profile is at user[0]
          }
      });
  } else {
      // No, redirect the user to the login page
      window.location.href = "/";
  }
}

export {signup, login, logout, token}
