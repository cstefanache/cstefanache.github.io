

(function(ns) {
  var app = angular.module('mrc', ['ngRoute']);


  app.service('searchable', ns.SearchService);


  app.config([
    '$routeProvider', function($routeProvider) {
      $routeProvider.when('/presentations', {
        templateUrl : 'pages/presentations.html'
      }).when('/blog/:dl', {
        templateUrl : 'pages/blog.html',
        controller : ns.BlogController
      }).when('/blog', {
        templateUrl : 'pages/blog.html',
        controller : ns.BlogController
      }).otherwise({
        redirectTo : '/blog'
      });
    }]);


  app.run(function($rootScope, $location, searchable) {

    $rootScope.searchFound = [];
    var blogItems = searchable.getBlogItems()

    $rootScope.doSearch = function(search) {
      $rootScope.searchFound.length = 0;
      if (search.length > 2) {
         $rootScope.searchFound = _.filter(blogItems, function(item){
           return (item.description.indexOf(search)!=-1 ||
             item.tags.indexOf(search)!=-1)
         });

      }
    }

    $rootScope.getSearchClass = function() {
      return $rootScope.searchFound.length>0 ? 'found' : 'none';
    }

    $rootScope.getMenuClass = function(name) {
      if (name===$location.url()) {
        return "menu selected";
      } else {
        return "menu";
      }
    }

    $rootScope.goTo = function(item) {
      $rootScope.searchFound = [];
      $rootScope.search = "";
      $location.url("/blog/"+item.dl);
    }

    $rootScope.moveTo = function(name) {
      $location.url("/"+name);
    }



  });
})(org.mrc);
