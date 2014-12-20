---
layout: post
title:  "Minimal AngularJS Application"
date:   2014-12-20 07:36:00
categories: js angularjs
---

Every time I start up playing around with a new framework or library, I encounter the same problem 
over and over: runtime errors. Most of the time i do not want best practices, clean code or high 
performance, I just want to see how it FEELS. 
 
This was the case with AngularJS as well - I got error even with the sample phone search application
that was offered as an example on their website. Since this is my first post I wanted to start small 
with a big problem.

The example below presents the minimal amount of code needed to see how AngularJS feels (The sample 
application can be tested [here][staticPage]). This is a simple application that presents the 
AngularJS double binding functionality and how this is bootstrapped.

{% highlight html %}
<html>
  <head>
    <script src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular.min.js"></script>
 </head>
 <body ng-app='minapp'>
    <div ng-controller='helloController'>
        <h2>Hello {{name}}</h2>
        <div>
            Name: <input ng-model='name'>
        </div>
        
    </div>
 </body>
</html>
{% endhighlight %}

{% highlight js %}
//Define minapp module
angular.module('minapp', []);

//Define hello controller
angular
  .module('minapp')
  .controller('helloController', ['$scope', function($scope) {
    $scope.name = 'untitled';
}]);
{% endhighlight %}

Starting with this piece of code you can add on top of it the complexity you need to make you happy.

Details (HTML Code):

+ **ng-app='minapp'** - bounds the current DOM element to the **minapp** module 
+ **ng-controller='helloController'** - bounds the current DOM element to the **helloController** controller
+ **\{\{name\}\}** - bounds the current element to the *name* variable defined on current scope (helloController's scope in this case)
+ **ng-model='name'** - bounds the value of the input to the *name* variable defined on current scope. The change is reflected sideways: Model -> View & View -> Model

Details (JS Code) :

+ **angular.module('minapp', [])** -  defines a new module *minapp* with no module dependencies ([]).
+ **angular.module('minapp').controller('helloController', ['$scope', function($scope) { }]);** 
 + defines a new controller on module *minapp* named *helloController*
 + **['$scope', function($scope) { }]** - first elements of the array represent the names of the injectables. The
   last element of the array represents the function that defines the actual logic for the controller. 



[staticPage]: static/angular-min-post/angular-min.html