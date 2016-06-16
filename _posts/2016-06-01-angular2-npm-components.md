---
layout: post
title:  "Create Angular2 NPM-ready components"
date:   2016-06-01 10:00
img: angular2-generic.png
thumb: mrc-angular2.png
categories: 
- blog
- typescript
- angular2
- components
- npm
---

# The oportunity #

If you worked in the past few years on projects using Angular 1.x, 
you might have noticed that not all components that are published on
**npm** are always the best. They might have performance issues,
are buggy or incomplete. Well, now is your chance - start creating
your AngularJS 2.x components. This blog post is presenting a step
by step guideline on how to create npm-ready components for Angular 2
applications.

## tl;dr ##

If you are in a hurry you can go to [this GitHub project](https://github.com/cstefanache/ng2-components)
where you can find a blueprint for starting your component. The blueprint
is used as baseline for (at least) one component published.

## Files and Folders ##

The minimal amount of files needed for your component is presented 
in the folder structure below. The GitHub repository (see tl;rd) contains
another **runtime** folder and **index.html** file that is used to test
locally your developed application.

```
[root]
  |
  +-[src]
  | |
  | +- ngGeneric.ts
  |
  +- .gitignore
  +- .npmignore
  +- index.ts
  +- package.json
  +- tsconfig.json
  +- typings.json
 
```

## Compilation erros fix ##

There are two major problems with packaging your component:

1. Duplicate identifier error.

When importing a new dependency you might get the following exception:

```
/node_modules/[some_lib]_/typings/browser/ambient/es6-shim/index.d.ts(8,14): error TS2300: Duplicate identifier 'PropertyKey'.
/node_modules/[some_lib]/typings/browser/ambient/es6-shim/index.d.ts(11,5): error TS2300: Duplicate identifier 'done'.
/node_modules/[some_lib]/typings/browser/ambient/es6-shim/index.d.ts(12,5): error TS2300: Duplicate identifier 'value'.
/node_modules/[some_lib]/typings/browser/ambient/es6-shim/index.d.ts(250,5): error TS2300: Duplicate identifier 'EPSILON'.
/node_modules/[some_lib]/typings/browser/ambient/es6-shim/index.d.ts(285,5): error TS2300: Duplicate identifier 'MAX_SAFE_INTEGER'.
```

This is triggered because the folder **typings** exist in the imported library and the *.d.ts* file used contains:

```
///<reference path="../typings/browser.d.ts"/>
```

Since using a **<reference>** tag is considered a bad practice then you should remove the tag everywhere used in your code.
After removing you might fall into the second problem:

2. Missing definitions.
Since angular is no longer using reference tag and removed the typings locally then the following error occur:

```
node_modules/@angular/core/src/application_ref.d.ts(39,88): error TS2304: Cannot find name 'Promise'.
node_modules/@angular/core/src/change_detection/differs/default_keyvalue_differ.d.ts(24,15): error TS2304: Cannot find name 'Map'.
node_modules/@angular/core/src/di/reflective_provider.d.ts(105,165): error TS2304: Cannot find name 'Map'.
node_modules/@angular/core/src/facade/collection.d.ts(1,25): error TS2304: Cannot find name 'MapConstructor'.
node_modules/@angular/core/src/facade/lang.d.ts(5,17): error TS2304: Cannot find name 'Set'.
...
```

This means that you should include the ambient typings at compilation. This can be achieved by setting the files
attribute in your tsconfig.json file to point to local ambient browser defs:

```
...
"files": [
    "typings/browser.d.ts"
  ],
...
```



### src/ngGeneric.ts ###

This is the root file for your component that you want to be published.
The example below is creating a component that displays the text 
*Hello World Component* inside a **<h4>** when used. If your logic need 
no DOM element creation consider creating directives instead.




```
import {Component} from '@angular/core';

@Component({
    selector: '[ng-generic]',
    template: '<h4>Hello World Component</h4>'
})
export class NgGeneric {
    constructor() {

    }
}
```

### .npmignore ###

contain rules that will be taken into consideration when creating the npm package.
In order to test your npm package build you can run a **npm pack** command
and a publish version of your package will be packed in the current folder.


```
# Node generated files
node_modules
npm-debug.log
# OS generated files
Thumbs.db
.DS_Store
runtime
dist
```

### index.ts ###

This is the typescript file that will be compiled into (index.d.ts, 
index.js and index.js.map) and represents the definition root of your
component. Using **index.ts** as entry point the main application will
use in the import statement only the component name as such:
```import {NgGeneric} from 'ng-generic';```

The index.ts file content will have to define what classes are exported
to the using application. 

```
export * from './src/ngGeneric';
```

### package.json ###

This file is your average **npm init** output with a little bit of spices.
Starting with Angular 2, I no longer make use of package builders for 
my sandbox application and I started using small *scripts* that are
executed directly from npm (Check the github repository to see how I
am using lite server to run the demo application).

```
{
  "name": "ng2-component",
  "version": "0.3.7",
  "description": "Angular2 Component",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yourgithub/project.git"
  },
  "scripts": {
    "prepublish": "tsc",
    "watch": "tsc -w "
  },
  "keywords": [
    "angular2"
  ],
  "license": "MIT",
  "devDependencies": {
    "@angular/common":  "2.0.0-rc.1",
    "@angular/compiler":  "2.0.0-rc.1",
    "@angular/core":  "2.0.0-rc.1",
    "@angular/http":  "2.0.0-rc.1",
    "@angular/platform-browser":  "2.0.0-rc.1",
    "@angular/platform-browser-dynamic":  "2.0.0-rc.1",
    "@angular/router":  "2.0.0-rc.1",
    "@angular/router-deprecated":  "2.0.0-rc.1",
    "@angular/upgrade":  "2.0.0-rc.1",

    "systemjs": "0.19.27",
    "es6-shim": "^0.35.0",
    "reflect-metadata": "^0.1.3",
    "rxjs": "5.0.0-beta.6",
    "zone.js": "^0.6.12",
    "angular2-in-memory-web-api": "0.0.7",
    "concurrently": "^2.0.0",
    "lite-server": "^2.2.0",
    "typescript": "^1.8.10",
    "typings": "^0.7.12"
  },
  "bugs": {
    "url": "https://github.com/yourgithub/project/issues"
  },
  "homepage": "https://github.com/yourgithub/project#readme",
  "author": "Your Name"
}

```

### tsconfig.js ###

In order to avoid any issues with different packaging or bundle scripts
the best way to define the typescript compiler configuration file is to
use **commonjs** as defined module and define a single root dependency
file that defines your component in the **files** property (index.js).
Also, make sure to exclude any folders that might publish any *.ts* 
file in order to keep the library to a bare minimum.

```
{
  "compilerOptions": {
    "removeComments": true,
    "noImplicitAny": false,
    "module": "commonjs",
    "target": "es5",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "declaration": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "rootDir": "."
  },
  "files": [
    "typings/browser.d.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "runtime",
    "typings/main",
    "typings/main.d.ts"
  ]
}
```

### typings.json ###

And last, but not least, the typing definitions as  ambient for your library. 

```
{
  "devDependencies": {},
  "ambientDependencies": {
    "es6-shim": "github:DefinitelyTyped/DefinitelyTyped/es6-shim/es6-shim.d.ts#7de6c3dd94feaeb21f20054b9f30d5dabc5efabd"
  }
}

```
