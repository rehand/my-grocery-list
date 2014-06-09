angular.module( 'myGroceryList.lists', [
  'ui.router',
  'placeholders',
  'ui.bootstrap'
])

.config(function config($stateProvider) {
  $stateProvider
    .state( 'lists', {
      url: '/lists',
      resolve: {
        lists:
            function(groceryListFactory){
                return groceryListFactory.query().$promise;
            }
      },
      views: {
        "main": {
          controller: 'ListsCtrl',
          templateUrl: 'lists/lists.tpl.html'
        }
      },
      data:{ pageTitle: 'Grocery Lists' }
    }).state('lists.detail', {
      url: '/:listId',
      views: {
        "": {
          controller: 'ListCtrl',
          templateUrl: 'lists/list.tpl.html'
        }
      },
      data:{ pageTitle: 'Grocery List' }
    });
})

.controller( 'ListsCtrl', function ListsCtrl($scope, lists) {
    $scope.lists = lists;
})

.controller('ListCtrl', function ListCtrl($scope, $stateParams, utils, GroceryListEntryFactory, $log) {
    $scope.list = utils.findById($scope.lists, $stateParams.listId);
    
    $scope.updateDone = function (entry) {
        entryDto = new GroceryListEntryFactory({id: entry.id, done:entry.done});
        entryDto.$update().then(
        function(success) {
            $log.info('success: ' + JSON.stringify(success));
        }, function(err) {
            entry.done = !entry.done;
            $log.error('error: ' + JSON.stringify(err));
        });
    };
})

;
