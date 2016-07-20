var app = null;

(function () {
  'use strict';

  app = angular.module('oa', [
    'ui.router',
    'ngResource',
    'ngAnimate',
    'foundation',
    'foundation.dynamicRouting',
    'foundation.dynamicRouting.animations',
    'ngStorage'
  ]);

  app.service = {
     'baseapi': 'http://localhost:8080/wxoa/',
   // 'baseapi': '/wxoa',
  };

  app.config(config);

  app.factory('oaCache', ['$cacheFactory', function ($cacheFactory) {
    return $cacheFactory('oa', {capacity: 50});
  }]);
  config.$inject = ['$urlRouterProvider', '$locationProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$httpProvider'];

  function config($urlProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $httpProvider, $rootScope) {
    $urlProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled: false,
      requireBase: false
    });

    //$locationProvider.hashPrefix('!');

    //angular sys-collections
    app.register =
    {
      controller: $controllerProvider.register,
      directive: $compileProvider.directive,
      filter: $filterProvider.register,
      factory: $provide.factory,
      service: $provide.service
    };
    //Post param
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

    $httpProvider.defaults.transformRequest = function (data) {
      if (angular.isObject(data)) {
        if (data instanceof FileList || data instanceof File) {
          return paramFile(data);
        }
        else {
          return param(data);
        }
      }
      else
        return data;
    };
  }

  app.run(['oaCache', function (oaCache) {
    app.register.directive('vLoading', vLoading);
    // app.register.directive('vPenSigner', vPenSigner);
     app.register.directive('inputOnChange',vInputFile);
  }]);

  var param = function (obj) {

    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

    for (name in obj) {
      value = obj[name];

      if (value instanceof Array) {
        for (i = 0; i < value.length; i++) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      } else if (value instanceof Object) {
        for (subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if (value !== undefined && value !== null) {
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }

    }
    return query.length ? query.substr(0, query.length - 1) : query;
  };

  var paramFile = function (data) {
    var fd = new FormData();
    angular.forEach(data, function (value, key) {
      if (value instanceof FileList) {
        if (value.length == 1) {
          fd.append(key, value[0]);
        } else {
          angular.forEach(value, function (file, index) {
            fd.append(key + '_' + index, file);
          });
        }
      } else {
        fd.append(key, value);
      }
    });

    return fd;
  }
})();

var vInputFile=function(){
  return{
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeFunc = scope.$eval(attrs.inputOnChange);
      element.bind('change', onChangeFunc);
    }
  }
}
var vLoading = function () {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'templates/common/loading.html',
    compile: function (element) {
      element.on('loading', function () {
        element.css('display', 'block');
      });
      element.on('end', function () {
        element.css('display', 'none');
      });
    },
    replace: true
  }
};

