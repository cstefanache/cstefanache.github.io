---
layout: post
title:  "Angular 2 Tags Input Component"
date:   2016-03-22 10:00:00
img: angular2-generic.png
thumb: mrc-angular2.png
categories: typescript angular2 blog
---

This is one of my first AngularJS 2 Component that I have to admit that I am
proud of. The component should mimimc JIRA tags editor input box.

Requirements:

+ should look like an input box
+ tags will be delimited with space character
+ defined tags will be styled as tags
+ if current tag is empty and user presses backspace then the latest tag will become editable

**Outcome**

![Adding watcher](/assets/img/blog/tags.png)

**The Code**

{% highlight js %}
import {Component} from 'angular2/core';

@Component({
   selector: '[tags]',
   template: `
    <ul (click)="focus()">
      <li class="tag" *ngFor="#item of tags">{{item}}</li>
      <li class="tag nopadding">
        <input id="tagInput"
               [(ngModel)]="current"
               (keyup)="keyUp($event)"
               (blur)="blur()" />
      </li>
    </ul>
   `,
   inputs: ['tags'],
   styles:[`
      ul {
        display: block;
        width: 100%;
        height: 34px;
        padding: 6px 12px;
        font-size: 14px;
        line-height: 1.4;
        color: #555;
        background-color: #fff;
        background-image: none;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      li {
        display: inline-block;
        padding-right: 6px;
        padding-left: 6px;
      }

      li.tag {
        background-color: #0073e6;
        color: #FFFFFF;
        margin-right: 2px;
      }

      li.tag.nopadding {
        color: #0073e6;
        background-color: #FFFFFF;
        padding: 0px;
      }

      input {
        border: 0px none;
        outline: none
      }
    `]
})

export class Tags {

  tags:Array<String>;
  current:String;

  constructor() {
    if (!this.tags) {
      this.tags = [];
    }
  }

  focus() {
    document.getElementById('tagInput').focus();
  }

  keyUp(event:KeyboardEvent) {
    if (event.keyCode === 32) {
      this.tags.push(this.current.substr(0, this.current.length-1));
      this.current = '';
    } else if (event.keyCode === 8 && this.current.length == 0){
      this.current = this.tags.pop();
    }
  }

  blur() {
    if (this.current !== '') {
      this.tags.push(this.current);
      this.current = '';
    }
  }



}

{% endhighlight %}

First of all let's import Component from  `angular2/core`
{% highlight js %}
import {Component} from 'angular2/core';
{% endhighlight %}

The next step is to define the component. The minimum amount of information that
needs to be included for our component is to define *selector* and *template* attributes.
Since the selector is defined as: '[tags]' it will enforce the usage as attribute of
our component as such:
{% highlight html %}<span [tags]="tagsArr"></span>{% endhighlight %}

The next step is to define the component template. All tags will be rendered as text
list items (**li**) except for the last one (current edit) that will be rendered as a
model of a **input** DOM element. In order to mimic input field behavior, when the
user clicks on any area of the component the **input** element should receive the focus.
In order to achieve this, a *(click)* event listener will be added to the main element.
For each element in the array we render a **li** element with the tag content inside
(having a *class="tag"* style). The last **li** in the component will contain the input
with the current edit model binding. With each key press the component will have to check
if one of the *space* or *backspace* keys were pressed in order to add the tag to the list
or to pull out from the list the last tag and make it last editable one. The last event
listener that has to be added is to automatically add the current edit tag into the tag
list when the input looses focus.

{% highlight html %}
<ul (click)="focus()">
  <li class="tag" *ngFor="#item of tags">{{item}}</li>
  <li class="tag nopadding">
    <input id="tagInput"
           [(ngModel)]="current"
           (keyup)="keyUp($event)"
           (blur)="blur()" />
  </li>
</ul>
{% endhighlight %}

In order to make our component reusable we need to define a input parameter that
will receive a reference to a data model from the parent: *inputs: ['tags']*.
The styles definition is a plain CSS definition that will allow you to bound a set of
styles to the current component. This can be achieved the classic way, with CSS,
as would (probably), most of you, would prefer.

**Class Definition**

The class definition holds the base logic for our component. It will define two
variables:
+ tags (Array<String>) - tags list model
+ current (String) - current edit model

The constructor logic makes sure that the tags array is defined and ready to get
binded to *ngFor.

+ *focus* - called on component click and will focus the input element
+ *keyUp* - checks if the current pressed key is 32 (Space) in order to add the
current edit to the list of tags or 8 (Backspace) in order to pop the last element
from the list and make it as current edit (if current is empty).
+ *blur* - adds the current edit (if not empty) to the array list

{% highlight js %}
export class Tags {

  tags:Array<String>;
  current:String;

  constructor() {
    if (!this.tags) {
      this.tags = [];
    }
  }

  focus() {
    document.getElementById('tagInput').focus();
  }

  keyUp(event:KeyboardEvent) {
    if (event.keyCode === 32) {
      this.tags.push(this.current.substr(0, this.current.length-1));
      this.current = '';
    } else if (event.keyCode === 8 && this.current.length == 0){
      this.current = this.tags.pop();
    }
  }

  blur() {
    if (this.current !== '') {
      this.tags.push(this.current);
      this.current = '';
    }
  }



}
{% endhighlight %}
