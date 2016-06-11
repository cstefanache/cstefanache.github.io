---
layout: post
title:  "Create Angular 2 Custom Decorators"
date:   2016-06-10 10:00
img: angular2-generic.png
thumb: mrc-angular2.png
categories: 
- blog
- typescript
- angular2
- decorators
---

# The Problem #
Angular 2 decorators are a great way to define the component/directive blueprint and a good way to understand the basic functionality of your logic in few lines of descriptive code.
One big problem that I see with them is that they are quite sealed - I did not manage to find a way to extend their functionality.
I really like the descriptive mode of ReactJS component styles and the hierarchical way LESS/SAAS is doing. I wanted the same thing in Angular 2 but I did not find a way to extend the styles @Component attribute to do so.
If there is another way to do it please leave a reply in the messages box at the bottom of the page.
The post is covering the way I managed to achieve the desired functionality using a custom decorator for styles attribute but it can be used for many purposes.

# The Preferred Way #
I would really wanted to define my local styles as the example below with a simple **extend** of the current functionality.

```
@Component({
  selector: 'my-app',
  template: '<h1>My First <span class="bold">Angular 2</span> App <span>...</span></h1>',
  styles: {
            'h1': {
              fontWeight: 300,
              border: '1px solid #000',
              'span': {
                color: '#FF0000',
                '&.bold': {
                  fontWeight: 700
                }
              }
            }
          }
})
```

# The Solution #

So digging into the source code of every NPM library involved in the process I managed to achieve the same result as such:


```
@Style({
  'h1': {
    fontWeight: 300,
    border: '1px solid #000',
    'span': {
      color: '#FF0000',
      '&.bold': {
        fontWeight: 700
      }
    }
  }
})
@Component({
  selector: 'my-app',
  template: '<h1>My First <span class="bold">Angular 2</span> App <span>...</span></h1>'
})
export class AppComponent { }

```

Here is a plnkr with the working solution:

<iframe src="http://embed.plnkr.co/gR61tCQl0EA40i0Ze6uY/" style="width: 100%; height: 300px"></iframe>

The advantage of this solution is that you can use javascript functions and variables as CSS attribute values so you can customize your component from javascript logic.
There was the possibility to use typescript string literals {{color}} to achieve the same javascript values customizations but I would lose the style nesting generation.
The example above will generate:

```
h1 { font-weight: 300; border: 1px solid #000; }
h1 span { color: #FF0000 }
h1 span.bold { font-weight: 700 }

```

# How  #
 
Well the solution is not that complicated. I was able to understand more about Typescript class annotations from this [blog post](http://blog.wolksoftware.com/decorators-reflection-javascript-typescript).
The fact is that you will only need to define a JS Function that will receive one parameter and will have to return a function that will be called with the annotated function constructor.
That was my starting point:

```
function Style(value) {
    //value represents the annotation parameter(s)
    return function (target) {
        //target is the constructor function
    }
}
```

Well thing got trickier when I needed to access Angular 2 metadata information. 

**First Problem** I had to dig into Angular2 code in order to understand that the annotations are parsed bottom up. 
So, the solution that is presented here requires that the annotation to be defined before the @Component or @Directive annotation so you can have access to it.

**Second Problem** You need to access window.Reflect object in order to do the magic and Angular2 will offer you a different one.
For this problem I had to access window reflect functionality in order to access constructor metadata (@Constructor) information.

```
 function Style(value) {
     var __ref__ = window['Reflect']
     
     function parseMeta(metaInformation) {
         for (var _i = 0, 
              metaInformation_1 = metaInformation; 
              _i < metaInformation_1.length; _i++) {
              
             var metadata = metaInformation_1[_i]; //metadata is @Component metadata
             //your logic here
             // mine was metadata.styles = [builtStyles]
         }
     }
     
     //value represents the annotation parameter(s)
     return function (target) {
         var metaInformation = __ref__.getOwnMetadata('annotations', target);
         if (metaInformation) {
             parseMeta(metaInformation);
         }
     }
 }
```

Since our decorator is placed before @Component annotation, when the returned function, of our custom annotation, will be executed, the constructor will already be populated with the info provided by @Component decorator.
At this point you can access, update or replace what is already defined in any of the @Component attributes with your custom property value. Since Angular 2 is processing all annotations before instantiating the component there is no risk of not having the custom logic executed.

That's it. This is the whole magic for creating your custom Angular 2 @Decorators.
This solution is not invasive, it will be executed once, when the first component is initialized (reduced performance impact) and allows you to extend basic Angular 2 functionality.

If you want to checkout the library for the @Style decorator it can be found [here](https://github.com/cstefanache/ng2-styler).

Have fun creating your own custom decorators. 