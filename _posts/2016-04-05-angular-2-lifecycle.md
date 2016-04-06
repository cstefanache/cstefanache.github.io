---
layout: post
title:  "Angular 2 Lifecycle Hooks"
date:   2016-04-04 07:00:00
img: angular2-generic.png
thumb: mrc-angular2.png
categories: 
- blog
- typescript
- angular2
---

Angular 2 Components and Directives have multiple lifetime hooks where custom logic can be executed.
One important aspect is to know what is executed when. In Angular <1.5 (prior to components) most of the 
time we would use a ```timeout(()=>{}, 0)``` in order to make sure that everything was initialized before
doing any crazy actions. In Angular 1.5 we have more advanced component lifetime hooks that can be 
read in details in Pascal's blog here: [Exploring Angular 1.5: Lifecycle Hooks](http://blog.thoughtram.io/angularjs/2016/03/29/exploring-angular-1.5-lifecycle-hooks.html)


## tl;dr ##

For those who are in a hurry, I embedded a video below with when each of the hook is executed based on the 
current state of the component initialization or runtime. 
<div style="text-align: center">
    <video controls loop>
      <source src="/assets/video/cp.webm" type="video/webm">
      Your browser does not support the video tag.
    </video>
</div>


## Definitions ##

Below you have a table with the hooks supported for directives/components and the definitions taken from the Angular JS Documentation.

|          Hook          | Directive | Component | Definition |
|------------------------|:---------:|:---------:|-------------|
| ngOnChanges            |<i class="glyphicon glyphicon-ok"></i>|<i class="glyphicon glyphicon-ok"></i>| Respond after Angular sets a data-bound input property. The method receives a changes object of current and previous values. |
|------------------------|-----------|-----------|-------------|
| ngOnInit               |<i class="glyphicon glyphicon-ok"></i>|<i class="glyphicon glyphicon-ok"></i>| Initialize the directive/component after Angular initializes the data-bound input properties. |
|------------------------|-----------|-----------|-------------|
| ngDoCheck              |<i class="glyphicon glyphicon-ok"></i>|<i class="glyphicon glyphicon-ok"></i>| Detect and act upon changes that Angular can or won't detect on its own. Called every change detection run. |
|------------------------|-----------|-----------|-------------|
| ngAfterContentInit     |           |<i class="glyphicon glyphicon-ok"></i>| After Angular projects external content into its view. |
|------------------------|-----------|-----------|-------------|
| ngAfterContentChecked  |           |<i class="glyphicon glyphicon-ok"></i>| After Angular checks the bindings of the external content that it projected into its view. |
|------------------------|-----------|-----------|-------------|
| ngAfterViewInit        |           |<i class="glyphicon glyphicon-ok"></i>| After Angular creates the component's view(s). |
|------------------------|-----------|-----------|-------------|
| ngAfterViewChecked     |           |<i class="glyphicon glyphicon-ok"></i>| After Angular checks the bindings of the component's view(s). |
|------------------------|-----------|-----------|-------------|
| ngOnDestroy            |<i class="glyphicon glyphicon-ok"></i>|<i class="glyphicon glyphicon-ok"></i>| Just before Angular destroys the directive/component. |


## The outcome ##

First thing to note is that when the ```constructor``` is executed input values are not populated and no view is initialized (no data, no DOM, no child component properties). 

After data-bound properties have been checked the ngOnChanges is executed. Starting with this lifecycle step you can freely customize your component based on the imput parameters of your component but not on child component states.
This lifecycle hook is good to take custom action based on the property values of the input attributes. This function is called automatically by Angular when an change event occurs.  

```
...
class MyComponent implements OnChanges {
  @Input() myProp: any;
  @Input() myProp2: any;

  ngOnChanges(changes: any) {
    console.log(JSON.stringify(changes));
  }
}
```

will output:

```
 {
   "myProp":{"previousValue":{},"currentValue":5},
   "myProp2":{"previousValue":{},"currentValue":0}
 }
```

The next step is **ngOnInit** that will be executed **only once** after all data-bindings were performed.

For people coming from *Angular 1.x*, probably, the **ngDoCheck** function is what you are seeking into building highly performant components. 
This function will be triggered with each change detection run - this is very similar with what the digest cycle dirty checking was doing in AngularJS 1.x. 

If you need to reference any DOM Element from your component the first (and probably) the best location to reference is in the next lifecycle: **ngAfterViewInit**. 
At this point in time the DOM of your component is complete and any @ViewChild property from your component will have a reference.  

```
@Component({
  selector: 'comp',
  template: `
    <span >
      <canvas #myCanvas>
      </canvas>
    </span>
  `
})
export class ImageCropperComponent {

  @ViewChild('myCanvas') canvas: ElementRef;

  constructor() {

  }

  ngAfterViewInit() {
    var canvas: any = this.cropcanvas.nativeElement;
    // Do your magic
  }
  
  ...
  
}
  
```

Here is a snippet with all the lifecycle hooks implementation:

```

import {
  OnChanges, SimpleChange,
  OnInit,
  DoCheck,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  OnDestroy
} from 'angular2/core';

@Component {
  selector: 'my-component',
  template: ''
}
export class MyComponent implements
              OnChanges, OnInit, DoCheck,
              AfterContentInit,AfterContentChecked,
              AfterViewInit, AfterViewChecked,
              OnDestroy {

  ngOnInit() {
    // Properties resolved
  }
  ngOnDestroy() {
    // Fin.
  }
  ngDoCheck() {
    // Custom change detection
  }
  ngOnChanges(changes) {
    // Bindings changed
  }
  ngAfterContentInit() {
    // Component content has been initialized
  }
  ngAfterContentChecked() {
    // Component content has been Checked
  }
  ngAfterViewInit() {
    // Component views are initialized
  }
  ngAfterViewChecked() {
    // Component views have been checked
  }

}

```
