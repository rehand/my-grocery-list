angular.module( 'myGroceryList.login', [
  'ui.router',
  'ui.bootstrap',
  'ngCookies'
])

.config(function config($stateProvider) {
  $stateProvider.state("login", {
    url: "/login",
    onEnter: function($state, $modal, $http, Base64, AuthFactory, COOKIE_NAMES, $cookieStore, $rootScope, $log) {
      dialog = $modal.open({
        templateUrl: "login/login.tpl.html",
        controller: function($scope, $log, $http) {
          $scope.dismiss = function() {
            $scope.$dismiss();
          };
          $scope.doLogin = function(user, password) {
            $log.log('login ' + user + "/" + password);
            
            loginData = 'Basic ' + Base64.encode(user + ':' + password);
            $http.defaults.headers.common['Authorization'] = loginData;
            $cookieStore.put(COOKIE_NAMES.login, loginData);
            
            auth = new AuthFactory();
            auth.$save().then(function(result) {
              if (result && result.username) {
                var loginName = result.username;
                $log.log("user logged in: " + loginName);
                $rootScope.userLoggedIn = loginName;
                $cookieStore.put(COOKIE_NAMES.loginName, loginName);
              }
              return $state.transitionTo("lists");
            });
          };
        }
      });
      
      dialog.result.then(function(result) {
        if (result) {
          return $state.transitionTo("lists");
        }
        // set dialog to null as it is already closed
        $state.dialog = null;
      }, function() {
          // set dialog to null as it is already dismissed
          $state.dialog = null;
      });
      
      $state.dialog = dialog;
    },
    onExit: function($state) {
      // close dialog if it is still opened
      if($state && $state.dialog) {
        $state.dialog.$dismiss();
      }
    }
  }).state('logout', {
    url: "/logout",
    onEnter: function($state, $http, AuthFactory, $rootScope, COOKIE_NAMES, $cookieStore) {
      $cookieStore.remove(COOKIE_NAMES.login);
      $cookieStore.remove(COOKIE_NAMES.loginName);
      $rootScope.userLoggedIn = null;
      $http.defaults.headers.common['Authorization'] = null;
      
      auth = new AuthFactory();
      promise = auth.$remove();
      promise['finally'](function() {
        // navigate to previous state
        $rootScope.back();
      });
    }
  });
})

;

