---
layout: post
title:  "Handling login transitions with Angular2 and SystemJS"
date:   2016-05-07 16:00
img: angular2-generic.png
thumb: mrc-angular2.png
categories: 
- blog
- typescript
- angular2
- zonejs
- systemjs
---

# The Problem #

With the growing popularity of AngularJS and Javascript Single page application one common problem occurs:
**handling login and permission routing**. 
Considering that the application user experience differs based on the current user permissions, the login and routing logic
gets even more complicated. In solving this problem we are going to take into account the loading time
of the application, app transitions, data passing and source code management.

Since Angular 2 takes full advantage of feature rich Typescript language and compiler, handling this problem
is much easier than other JS frameworks but it can be optimised for full speed and seamless transition 
between the applications.

# The "usual" solution #

The first solution is to pack each individual user experience into multiple js applications
depending on the role. The advantage of this solution is that the login application will be really
light, holding just the basic authentication logic and the responsibility to forward to the correct
application based on the current user role. 

# Optimising solution #

The disadvantage of the solution presented above is that when the *login application* is forwarding
the user to the correct app based on its role, you will experience a web page reload to the new path.
Since the new application needs the minimal set of dependencies to be loaded in order to work 
(Angular2, polyfills, shims, rx etc.) the transition will result in a longer "flicker"

Another disadvantage of the first solution is that when transitioning from one app to the
other you will have to rely on local storage or cookies in order to store authentication
data such as login token. Also, if the login api returns user data, this information will 
be lost when the application  is changed (eg. login -> user || login -> administrator) 
and another request must be performed when administrator or user app is loaded.

The preferred solution is to load the dependencies and the login application once and,
after a successful login, the required application based on the role. 
Using this solution, if the application is provided by a portal, 
where usually header and footer are provided by the server the transition will be more seamless. 

In order to solve data passing from one app to the other problem, 
a global variable defined outside Angular context can be used in order 
to store and load info when one application is changed to the other.

Using this approach, in a development environment, the login application will load in approx 400ms (see image below).

![Loading time](/assets/img/blog/handling_login_1.png)

The *index.html* file for this approach will look like this (no styles included):

```
<html>
<head>
    <script src="node_modules/es6-shim/es6-shim.min.js"></script>
    <script src="node_modules/systemjs/dist/system-polyfills.js"></script>
    <script src="node_modules/angular2/es6/dev/src/testing/shims_for_IE.js"></script>
    <script src="node_modules/angular2/bundles/angular2-polyfills.js"></script>
    <script src="node_modules/systemjs/dist/system.src.js"></script>
    <script src="node_modules/rxjs/bundles/Rx.js"></script>
    <script src="node_modules/angular2/bundles/angular2.dev.js"></script>
    <script src="node_modules/angular2/bundles/http.dev.js"></script>
    <script src="node_modules/angular2/bundles/router.js"></script>

</head>

<body>

    <app>Loading ...</app>
    <script>
    
        System.import('dist/login.js').then(function (data) {
            System.import('login/app');
        });
    
    </script>
</body>
</html>
```

Where the definition of the login component looks like:

```
import 'rxjs/Rx';
import {Component} from 'angular2/core';
import {Http, BaseRequestOptions, Response, Headers, HTTP_PROVIDERS} from 'angular2/http';

@Component({
    selector: 'app',
    template: `
    <form name="loginForm" (submit)="onSubmit()">
        <div>Username: <input [(ngModel)]="username" type="text" name="username"></div>
        <div>Password: <input [(ngModel)]="password" type="password" name="password"></div>
        <button type="submit">Submit</button>
    </form>
    `
})
export class AppComponent {

    constructor(public authService:AuthService) {
        super();
    }


    public onSubmit():void {
        //do login request
    }

}
```

When SystemJS finishes loading the ```dist/login.js``` application Angular2 will
initialize the Login AppComponent inside the ```<app>``` DOM Element. It will populate it with
the basic login form and will hold the submit logic. Since we are dealing with a SPA, 
the submit logic will perform the AJAX request to the server and it will handle the 
response internally. Ideally, on a successful login, we would like to replace the 
login application with the application for the logged in user role similar with 
the one that we used to load the login application. 

```
public onSubmit():void {
  this.http.post('some/login/api', creds, {
    headers: headers
  })
  .map(res => res.json())
  .subscribe(
    data => this.forward(data),
    err => this.logError(err)
  );
}


forward(data:any):void {

  //Nice solution but it does not work.
  if (data.role.admin) {   
    System.import('dist/admin.js').then(function (data) {
        System.import('admin/app');
    });
  } else {
    System.import('dist/user.js').then(function (data) {
        System.import('user/app');
    });
  }
}

```

The solution above would be the easiest to implement and handle the 
roles but the following error will be triggered:

```
angular2.dev.js:25644 EXCEPTION: Expected to not be in Angular Zone, but it is!
angular2.dev.js:25644 STACKTRACE:BrowserDomAdapter.logError 
angular2.dev.js:25644 Error: Expected to not be in Angular Zone, but it is!
    at new BaseException (http://localhost:8080/node_modules/angular2/bundles/angular2.dev.js:5496:21)
    at Function.NgZone.assertNotInAngularZone 

```

The error is thrown when you try to replace the current running application with 
the another that is loaded lazy. The solution to this problem is to exit from the
Angular2 application when performing this load in order to prevent the error. 
The best way to do this is to dispatch an event that will be listened by
a logic that is executed outside already loaded app AngularJS zone.

In order to achieve this the ```index.html``` file will hold the listener 
for loading the app as such:

```
<script>

    document.addEventListener('load', function (e) {
        var file = e.detail.file;
        var module = e.detail.module;
        System.import(file).then(function () {
            System.import(module);
        });
    });


    System.import('dist/login.js').then(function (data) {
        System.import('login/app');
    });


</script>
```
The listener will wait for a detail object that will contain the file name
to be loaded and the module name to be executed. 
In this case, the forwarding function from the login application will be replaced with
the event dispatchers containing different file names (or modules) based on login information:

```
forward(data:any):void {

  if (data.role.admin) {   
    document.dispatchEvent(new CustomEvent('load', {
        detail: {
            file: 'dist/admin.js',
            module: 'admin/app'
        }
    }));
  } else {
    document.dispatchEvent(new CustomEvent('load', {
        detail: {
            file: 'dist/user.js',
            module: 'user/app'
        }
    }));
  }
}
```

Using this approach the```<app>``` DOM element will be replaced with the correct application
only when the application is loaded resulting in a minimum application change flicker.