angular.module( 'myGroceryList.lists', [
  'ui.router',
  'placeholders',
  'ui.bootstrap'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'lists', {
    url: '/lists',
    views: {
      "main": {
        controller: 'ListsCtrl',
        templateUrl: 'lists/lists.tpl.html'
      }
    },
    data:{ pageTitle: 'Grocery Lists' }
  });
})

.controller( 'ListsCtrl', function ListsCtrl( $scope ) {
})

;
