angular.module( 'myGroceryList.login', [
  'ui.router',
  'ui.bootstrap'
])

.config(function config($stateProvider) {
  $stateProvider.state("login", {
    url: "/login",
    onEnter: function($state, $modal, $http, Base64, AuthFactory) {
      dialog = $modal.open({
        templateUrl: "login/login.tpl.html",
        controller: function($scope, $log, $http) {
          $scope.dismiss = function() {
            $scope.$dismiss();
          };
          $scope.doLogin = function(user, password) {
            auth = new AuthFactory();
            $log.log('login ' + user + "/" + password);
            $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode(user + ':' + password);
            return auth.$save();
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
            $state.dialog.dismiss();
        }
    }
  });
})

;

