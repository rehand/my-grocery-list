angular.module( 'myGroceryList', [
  'templates-app',
  'templates-common',
  'myGroceryList.home',
  'myGroceryList.about',
  'myGroceryList.lists',
  'ui.router',
  'ngResource'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | myGroceryList' ;
    }
  });
})

.factory('groceryListFactory', function($resource) {
    return $resource('/api/list/:listId', { listId:'@id' });
})

.factory('utils', function() {
  return {
    // Util for finding an object by its 'id' property among an array
    findById: function findById(a, id) {
      for (var i = 0; i < a.length; i++) {
        if (a[i].id == id) {
          return a[i];
        }
      }
      return null;
    }
  };
})

;

