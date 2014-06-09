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
    }).state('lists.detail.edit', {
      url: '/:entryId/edit',
      views: {
        "edit": {
          controller: 'ListEditCtrl',
          templateUrl: 'lists/entry.edit.tpl.html'
        }
      }
    });
})

.controller( 'ListsCtrl', function ListsCtrl($scope, lists) {
    $scope.lists = lists;
})

.controller('ListCtrl', function ListCtrl($scope, $stateParams, utils, GroceryListEntryFactory, $log) {
    $scope.list = utils.findById($scope.lists, $stateParams.listId);
    
    $scope.updateDone = function(entry) {
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

.controller('ListEditCtrl', function ListEditCtrl($scope, $stateParams, utils, GroceryListEntryFactory, $log, $state) {
    $scope.entry = utils.findById($scope.list.entries, $stateParams.entryId);
    
    $scope.newEntry = {
        title : $scope.entry.title,
        description : $scope.entry.description
    };
    
    $scope.save = function(entry) {
        entryDto = new GroceryListEntryFactory({
            id : entry.id,
            title : $scope.newEntry.title,
            description : $scope.newEntry.description
        });
        entryDto.$update().then(
            function(success) {
                angular.extend($scope.entry, success);
                $log.info('update success: ', JSON.stringify(success));
            },
            function(err) {
                $log.error('update error: ', JSON.stringify(err));
            }
        );
        
        utils.navigateUp($state, $stateParams);
    };
    
    $scope.cancel = function() {
        utils.navigateUp($state, $stateParams);
    };
    
    $scope.deleteEntry = function(entry) {
        entryDto = new GroceryListEntryFactory(entry);
        entryDto.$remove().then(
            function(success) {
                $scope.list.entries.splice($scope.list.entries.indexOf(entry), 1);
                $log.info("delete success", success);
            },
            function(err) {
                $log.info("delete error", err);
            }
        );
    };
})

;
