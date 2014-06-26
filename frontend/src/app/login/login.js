angular.module( 'myGroceryList.login', [
  'ui.router',
  'ui.bootstrap',
  'ngCookies'
])

.config(function config($stateProvider) {
  $stateProvider.state("login", {
    url: "/login",
    onEnter: function($state, AuthHandler) {
      AuthHandler.login($state, true);
    },
    onExit: function($state) {
      // close dialog if it is still opened
      if($state && $state.dialog) {
        $state.dialog.dismiss();
      }
    }
  }).state('logout', {
    url: "/logout",
    onEnter: function($state, AuthHandler) {
      AuthHandler.logout($state);
    }
  });
})

;

