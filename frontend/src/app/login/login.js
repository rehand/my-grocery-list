angular.module( 'myGroceryList.login', [
  'ui.router',
  'ui.bootstrap',
  'ngCookies'
])

.config(function config($stateProvider) {
  $stateProvider.state("login", {
    url: "/login",
    onEnter: function($state, AuthFactory, COOKIE_NAMES, $cookieStore, $rootScope, $log, $window) {
      auth = new AuthFactory();
      auth.$save().then(function(result) {
        if (result) {
          if (result.username) {
            var loginName = result.username;
            $log.log("user logged in: " + loginName);
            $rootScope.userLoggedIn = loginName;
            $cookieStore.put(COOKIE_NAMES.loginName, loginName);
            $state.transitionTo("lists");
          } else if (result.loginUrl) {
            $window.location = result.loginUrl;
          }
        }
      });
    },
    onExit: function($state) {
      // close dialog if it is still opened
      if($state && $state.dialog) {
        $state.dialog.dismiss();
      }
    }
  }).state('logout', {
    url: "/logout",
    onEnter: function($state, AuthFactory, $rootScope, COOKIE_NAMES, $cookieStore, $window) {
      $cookieStore.remove(COOKIE_NAMES.loginName);
      $rootScope.userLoggedIn = null;
      
      auth = new AuthFactory();
      promise = auth.$remove().then(function(result) {
        $window.location = result.logoutUrl;
      });
    }
  });
})

;

