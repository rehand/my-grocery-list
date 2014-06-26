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

.controller('AppCtrl', function AppCtrl($scope, $location) {
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

// http://wemadeyoulook.at/en/blog/implementing-basic-http-authentication-http-requests-angular/
.factory('Base64', function() {
  var keyStr = 'ABCDEFGHIJKLMNOP' +
    'QRSTUVWXYZabcdef' +
    'ghijklmnopqrstuv' +
    'wxyz0123456789+/' +
    '=';
  return {
    encode: function (input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;
 
      do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
 
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
 
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }
 
        output = output +
          keyStr.charAt(enc1) +
          keyStr.charAt(enc2) +
          keyStr.charAt(enc3) +
          keyStr.charAt(enc4);
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);
 
      return output;
    },
 
    decode: function (input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;
 
      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
        alert("There were invalid base64 characters in the input text.\n" +
          "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
          "Expect errors in decoding.");
      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
      do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));
 
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
 
        output = output + String.fromCharCode(chr1);
 
        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
 
        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";
 
      } while (i < input.length);
 
      return output;
    }
  };
})

;

