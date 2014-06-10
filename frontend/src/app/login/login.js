angular.module( 'myGroceryList.login', [
  'ui.router',
  'ui.bootstrap'
])

.config(function config($stateProvider) {
  $stateProvider.state("login", {
    url: "/login",
    onEnter: function($stateParams, $state, $modal, $resource) {
      dialog = $modal.open({
        templateUrl: "login/login.tpl.html",
        controller: function($scope, $log) {
          $scope.dismiss = function() {
            $scope.$dismiss();
          };
          $scope.login = function() {
            $log.log('login');
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

