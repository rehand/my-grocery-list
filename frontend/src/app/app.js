angular.module( 'myGroceryList', [
  'templates-app',
  'templates-common',
  'myGroceryList.home',
  'myGroceryList.about',
  'myGroceryList.lists',
  'myGroceryList.login',
  'ui.router',
  'ngResource'
])

.factory('authHttpResponseInterceptor', function($q, $location, $log){
    return {
        response: function(response){
            if (response.status === 403) {
                $log.log("Response " + response.status);
            }
            return response || $q.when(response);
        },
        responseError: function(rejection) {
            if (rejection.status === 403) {
                $log.log("Response Error ", rejection);
                $location.path('/login').search('returnTo', $location.path());
            }
            return $q.reject(rejection);
        }
    };
})

.config( function myAppConfig ($urlRouterProvider, $httpProvider) {
  $urlRouterProvider.otherwise('/home');
  
  // set CSRF cookie and header name
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  
  // HTTP interceptor to check auth failures for XHR requests
  $httpProvider.interceptors.push('authHttpResponseInterceptor');
})

.run( function run ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    
    $rootScope.$on("$stateChangeSuccess",  function(event, toState, toParams, fromState, fromParams) {
        // to be used for back button //won't work when page is reloaded.
        $rootScope.previousState_name = fromState.name;
        $rootScope.previousState_params = fromParams;
    });
    // back button function called from back button's ng-click="back()"
    $rootScope.back = function() {
        if($rootScope.previousState_name) {
            $state.go($rootScope.previousState_name,$rootScope.previousState_params);
        }
    };
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if (angular.isDefined(toState) && angular.isDefined(toState.data) && angular.isDefined(toState.data.pageTitle)) {
      $scope.pageTitle = toState.data.pageTitle + ' | myGroceryList' ;
    }
  });
})

.factory('GroceryListFactory', function($resource) {
    return $resource('/api/list/:listId', 
            { listId: '@id' },
            // use PATCH for partial updates
            { update: { method: 'PATCH' }});
})

.factory('GroceryListEntryFactory', function($resource) {
    return $resource('/api/entry/:entryId',
            { entryId: '@id' },
            // use PATCH for partial updates
            { update: { method: 'PATCH' }}
    );
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
    },
    navigateUp: function navigateUp(state, stateParams) {
        state.go('^', stateParams);
    },
    navigateDoubleUp: function navigateUp(state, stateParams) {
        state.go('^.^', stateParams);
    }
  };
})

;

