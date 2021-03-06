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
          function(GroceryListFactory){
            return GroceryListFactory.query().$promise;
          }
      },
      views: {
        "main": {
          controller: 'ListsCtrl',
          templateUrl: 'lists/lists.tpl.html'
        }
      },
      data:{ pageTitle: 'Grocery Lists' }
    })
    
    .state('lists.detail', {
      url: '/{listId:[0-9]+}',
      views: {
        "": {
          controller: 'ListCtrl',
          templateUrl: 'lists/list.tpl.html'
        }
      },
      data:{ pageTitle: 'Grocery List' }
    })
    
    .state('lists.createList', {
      url: '/create',
      views: {
        "": {
          controller: 'ListCreateCtrl',
          templateUrl: 'lists/list.edit.tpl.html'
        }
      }
    })
    
    .state('lists.detail.editList', {
      url: '/edit',
      views: {
        "edit": {
          controller: 'ListEditCtrl',
          templateUrl: 'lists/list.edit.tpl.html'
        }
      }
    })
    
    .state('lists.detail.createEntry', {
        url: '/entries/create',
        views: {
          "edit": {
            controller: 'EntryCreateCtrl',
            templateUrl: 'lists/entry.edit.tpl.html'
          }
        }
    })
    
    .state('lists.detail.editEntry', {
      url: '/entries/{entryId:[0-9]+}/edit',
      views: {
        "edit": {
          controller: 'EntryEditCtrl',
          templateUrl: 'lists/entry.edit.tpl.html'
        }
      }
    })
    
    ;
})

.controller( 'ListsCtrl', function ListsCtrl($scope, lists) {
  $scope.lists = lists;
  
  $scope.hasUnfinishedEntries = function (list) {
    list.unfinishedEntriesCount = list.entries.filter(function (entry) {
      return !entry.done;
    }).length;
    
    return list.unfinishedEntriesCount > 0;
  };
})

.controller('ListCtrl', function ListCtrl($scope, $state, $stateParams, utils, GroceryListEntryFactory, $log, GroceryListFactory) {
  $scope.list = utils.findById($scope.lists, $stateParams.listId);
  
  $scope.updateDone = function(entry) {
    entryDto = new GroceryListEntryFactory({id: entry.id, done: entry.tmpDone});
    entryDto.$update().then(
      function(success) {
        entry.done = success.done;
        $log.info('success: ', success);
      }, 
      function(err) {
        entry.tmpDone = entry.done;
        $log.error('error: ', err);
      }
    );
  };
  
  $scope.archiveList = function(list) {
    listDto = new GroceryListFactory({
      id: list.id, 
      visible: false
    });
    
    listDto.$update().then(
      function(success) {
        $scope.lists.splice($scope.lists.indexOf(list), 1);
        utils.navigateUp($state, $stateParams);
        $log.info("archive list success", success);
      },
      function(err) {
        $log.info("archive list error", err);
      }
    );
  };
})

.controller('ListCreateCtrl', function ListCreateCtrl($scope, $stateParams, utils, GroceryListFactory, $log, $state) {
  $scope.tmpList = {
    title : '',
    description : ''
  };
  
  $scope.save = function(list) {
    listDto = new GroceryListFactory($scope.tmpList);
    listDto.$save().then(
      function(success) {
        $scope.lists.push(success);
        $state.go("lists.detail", {listId: success.id});
        $log.info('create list success: ', success);
      },
      function(err) {
        $log.error('create list error: ', err);
      }
    );
  };
  
  $scope.cancel = function() {
      utils.navigateUp($state, $stateParams);
  };
})

.controller('ListEditCtrl', function ListEditCtrl($scope, $stateParams, utils, GroceryListFactory, $log, $state) {
  $scope.tmpList = {
    title : $scope.list.title,
    description : $scope.list.description
  };
  
  $scope.save = function(list) {
    listDto = new GroceryListFactory({
      id : list.id,
      title : $scope.tmpList.title,
      description : $scope.tmpList.description
    });
    listDto.$update().then(
      function(success) {
        angular.extend($scope.list, success);
        $log.info('update list success: ', success);
      },
      function(err) {
        $log.error('update list error: ', err);
      }
    );
    
    utils.navigateUp($state, $stateParams);
  };
  
  $scope.cancel = function() {
    utils.navigateUp($state, $stateParams);
  };
  
  $scope.deleteList = function(list) {
    listDto = new GroceryListFactory(list);
    listDto.$remove().then(
      function(success) {
        $scope.lists.splice($scope.lists.indexOf(list), 1);
        utils.navigateDoubleUp($state, $stateParams);
        $log.info("delete list success", success);
      },
      function(err) {
        $log.info("delete list error", err);
      }
    );
  };
})

.controller('EntryEditCtrl', function EntryEditCtrl($scope, $stateParams, utils, GroceryListEntryFactory, $log, $state) {
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
        $log.info('update entry success: ', success);
      },
      function(err) {
        $log.error('update entry error: ', err);
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
        utils.navigateUp($state, $stateParams);
        $log.info("delete entry success", success);
      },
      function(err) {
        $log.info("delete entry error", err);
      }
    );
  };
})

.controller('EntryCreateCtrl', function EntryCreateCtrl($scope, $stateParams, utils, GroceryListEntryFactory, $log, $state) {
  $scope.newEntry = {
    title : '',
    description : '',
    done: false,
    grocery_list: $scope.list.id
  };
  
  $scope.save = function(entry) {
    entryDto = new GroceryListEntryFactory($scope.newEntry);
    entryDto.$save().then(
      function(success) {
        $scope.list.entries.push(success);
        $log.info('create success: ', success);
      },
      function(err) {
        $log.error('create error: ', err);
      }
    );
    
    utils.navigateUp($state, $stateParams);
  };
  
  $scope.cancel = function() {
    utils.navigateUp($state, $stateParams);
  };
})

;
