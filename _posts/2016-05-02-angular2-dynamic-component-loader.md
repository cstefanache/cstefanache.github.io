---
layout: post
title:  "$compile is dead! Long live DynamicComponentLoader"
date:   2016-05-12 16:00
img: angular2-generic.png
thumb: mrc-angular2.png
categories: 
- blog
- typescript
- angular2
---

# The Gem #

The $compile service had always been the gem of Angular 1. It was like
the party trick that allowed you to wow people and offer you the possibility
to render anything, at any time and somehow safe. The $compile alternative in Angular 2 
is DynamicComponentLoader, not as flashy as its big brother 
but is doing its job in a safer manor. 

# tldr; #
Here is a plnkr example using DynamicComponentLoader (Angular 2.0.0 RC1):

 + `loader.ts` holds the loading logic
 + `components.ts` holds the components that will be loaded dynamically
 + `app.ts` holds the logic and the container for component loading 

<iframe src="https://embed.plnkr.co/ZM2wSc/" style="width: 100%; height: 400px"></iframe>


# DynamicComponentLoader #
This class suffered a lot of changes during the development of the framework
and some of the tutorials out there might reference methods that no longer exist (such as loadIntoLocation) 
 - *the examples presented here are using Angular 2.0.0 RC1*.

The class is exposing two methods: 

```
loadAsRoot (
    type: Type, 
    overrideSelectorOrNode: string | any, 
    injector: Injector, 
    onDispose?: () => void, 
    projectableNodes?: any[][]) : Promise<ComponentRef>
``` 

and 

```
loadNextToLocation(
    type: Type, 
    location: ViewContainerRef, 
    providers?: ResolvedReflectiveProvider[], 
    projectableNodes?: any[][]) : Promise<ComponentRef>
```

As you might notice neither of the function is expecting a template as $compile did
and passing input data can be a little bit tricky; but we are going to clear
everything up by the end of this post. 

Instead of passing a string template, the component loader functions is 
waiting for a `Type` to load (angular component class *not instance*).

`loadAsRoot` is used when you need to replace a dom element with the dynamic loaded component.
The element that will be replaced with your content will be passed as query selector or actual
node reference to the `overrideSelectorOrNode` parameter. Be aware that the component
will replace the original node in the application so the original reference to the root element
will no longer be available (if another load is necessary). The `injector` is necessary
to be passed in order to allow the component access application providers - you can
get it by injecting it in the current component `constructor( @Inject(Injector) private injector:Injector) {}`.
(usage: see `app.ts` from provided plnkr)

`loadNextToLocation` is more fun than loadAsRoot because it is not replacing the original
content and can be reused multiple times. The big difference between the first function
and this one is that you will need an Angular ViewContainer reference in order to be passed
as container to load the dynamic component (this parameter *does not* accept queries). 
(usage: see `loader.ts` from provided plnkr).
 
# Passing data #

The second trick in loading dynamic components is to pass data (if necessary) so the 
component to be rendered correctly. In angular 1 you had to pass the `$scope` containing
the data to the provided link function by the $compile service and it would render it
based on that info. (eg: `$compile('<span>{{param1}}</span>')($scope)`).
Well, in Angular2, execution of any of the function will return a promise with
the built component reference as parameter that will be called when the component
is ready to be initialized. Having the component reference you can access its instance
and set the desired data as input data.

```

load():void {
    this.loader.loadNextToLocation(DynamicComponentToBeLoaded, this.viewContainerRef)
        .then((ref:ComponentRef<Type>) => {    
            ref.instance.data1 = 'string data';
            ref.instance.numberAttribute =  42;
            return ref;
        }
    );
}

```

# The plnkr #

The main point of interest of the plnkr from this post is the `loader.ts` file.
The loader is built to be generic (you can copy - paste it into your code and it will work)
and also is meant to reuse the container that is is built in. I used it 
in order to render content in a sidebar that never gets destroyed. One important aspect
is to destroy the previous built component in order to avoid memory leaks:
```
if (this.componentRef) {
    this.componentRef.destroy();
}
```

I really have the feeling that DynamicComponentLoader is not exactly an 
alternative to $compile function but the basic functionality is the same.
In angular 1 I built a ton of directives that were building their content
dynamically based on the provided data with huge success and it was really 
fun - but I really think that the Angular 2 way is more safe.

