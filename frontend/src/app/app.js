angular.module( 'myGroceryList', [
  'templates-app',
  'templates-common',
  'myGroceryList.home',
  'myGroceryList.lists',
  'myGroceryList.login',
  'ui.router',
  'ngResource',
  'ngCookies'
])

.constant('COOKIE_NAMES', {
    loginName: 'loginName',
    csrfToken: 'csrftoken'
})

.factory('authHttpResponseInterceptor', function($q, $location, $log, COOKIE_NAMES, $cookieStore, $rootScope) {
  return {
    response: function(response) {
      if (response.status === 403) {
        $log.log("Response " + response.status);
      }
      return response || $q.when(response);
    },
    responseError: function(rejection) {
      if (rejection.status === 401) {
        $log.log("Response Error ", rejection);
        $cookieStore.remove(COOKIE_NAMES.loginName);
        $rootScope.userLoggedIn = null;
        $rootScope.$state.go('login');
      }
      return $q.reject(rejection);
    }
  };
})

.factory('AuthHandler', function(AuthFactory, COOKIE_NAMES, $cookieStore, $rootScope, $log, $window) {
  return {
    login: function($state, doRedirect) {
      auth = new AuthFactory();
      auth.$save().then(function(result) {
        if (result) {
          if (result.username) {
            var loginName = result.username;
            $log.log("user logged in: " + loginName);
            $rootScope.userLoggedIn = loginName;
            $cookieStore.put(COOKIE_NAMES.loginName, loginName);
            
            if (doRedirect && $state) {
              $state.transitionTo("lists");
            }
          } else if (doRedirect && result.loginUrl) {
            $window.location = result.loginUrl;
          }
        }
      });
    },
    logout: function($state) {
      $cookieStore.remove(COOKIE_NAMES.loginName);
      $rootScope.userLoggedIn = null;
      
      auth = new AuthFactory();
      promise = auth.$remove().then(function(result) {
        $window.location = result.logoutUrl;
      });
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

.run( function run ($rootScope, $state, $stateParams, $log, AuthHandler, $location) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  
  $rootScope.$on("$stateChangeSuccess",  function(event, toState, toParams, fromState, fromParams) {
    // to be used for back button - won't work when page is reloaded.
    $rootScope.previousState_name = fromState.name;
    $rootScope.previousState_params = fromParams;
  });
  // back button function called from back button's ng-click="back()"
  $rootScope.back = function() {
    if($rootScope.previousState_name) {
      $state.go($rootScope.previousState_name, $rootScope.previousState_params);
    }
  };
  
  // call login when app is loaded (only if not in login state)
  if ($location.path() !== '/login') {
    AuthHandler.login(null, false);
  }
})

.controller('AppCtrl', function AppCtrl($scope, $location, $http) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if (angular.isDefined(toState) && angular.isDefined(toState.data) && angular.isDefined(toState.data.pageTitle)) {
      $scope.pageTitle = toState.data.pageTitle + ' | myGroceryList' ;
    }
    
    // collapse menu after changing state if not collapsed
    if (angular.isDefined($scope.menuCollapsed)) {
        if (!$scope.menuCollapsed) {
            $scope.menuCollapsed = true;
        }
    }
  });
  
  $scope.isLoading = false;
  
  $scope.isLoadingFct = function() {
    return $http.pendingRequests.length > 0;
  };
  
  $scope.$watch($scope.isLoadingFct, function(val) {
    $scope.isLoading = val;
  });
})

.factory('GroceryListFactory', function($resource) {
  return $resource(
    '/api/list/:listId', 
    {listId: '@id'},
    // use PATCH for partial updates
    {update: {method: 'PATCH'}}
  );
})

.factory('GroceryListEntryFactory', function($resource) {
  return $resource(
    '/api/entry/:entryId',
    {entryId: '@id'},
    // use PATCH for partial updates
    {update: {method: 'PATCH'}}
  );
})

.factory('AuthFactory', function($resource) {
  return $resource('/api/auth/');
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

