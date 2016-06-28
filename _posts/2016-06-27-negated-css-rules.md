---
layout: post
title:  "Negated CSS Rules"
date:   2016-06-10 10:00
img: css-generic.png
thumb: mrc-css.png
categories: 
- blog
- CSS
---

I started to get more and more interested on how to develop fast mobile first applications optimized for a low set of resources.
One interesting topic is how much responsibility we give to each component that take part in our page display, and of course, I am referring to CSS and JS. 
In order to achieve this performance we will have to remove JS logic for rendering and take advantage of the browser CSS engine implementation.

# tl;dr #

Here is a CodePen with the desired functionality on each device (and the source code)

<p data-height="300" data-theme-id="24408" data-slug-hash="mEWXQJ" data-default-tab="result" data-user="shellenstein" data-embed-version="2" class="codepen">See the Pen <a href="http://codepen.io/shellenstein/pen/mEWXQJ/">negated CSS rules</a> by Cornel Stefanache (<a href="http://codepen.io/shellenstein">@shellenstein</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

## Requirements ##

1. Desktop:  
 - **Default**: left navigation is fully expanded showing icons and text
 - **On toggle**: reduce width of the left navigation and display only the icons and expand the size of the content
2. Tablet: 
 - **Default**: left navigation have a reduced width showing only icons
 - **On toggle**: display the navigation text over the content
3. Mobile: 
 - **Default**: left navigation is not visible on the screen
 - **On toggle**: display the full navigation over the content



# The logic #

Considering that our default mode is Desktop, the default rules for our CSS are:

## Desktop ##

```scss
.container {
    .menu {
      position: absolute;
      top: 25px;
      left: 0px;
      bottom: 0px;
      width: 100px;
      background-color: rgba(255, 125, 125, 1);
      overflow: hidden;
      transition: all 0.3s ease-in-out;
    }
    .content {
      margin-top: 5px;
      margin-left: 105px;
      margin-right: 5px;
      background-color: rgba(125, 125, 125, 0.5);
      transition: all 0.3s ease-in-out;
    }
}
```

This will put the *menu* with an absolute position on the left, having an expanded width of 100px and the *content* having a left margin with the size of the menu +5px.
The *collapsed* class will be removed or added to the ".container" element by clicking the menu icon (top left). By default, at inital page rendering the container will **not** have the *collapsed* class assigned.
When toggled, on the current desktop display, we have to reduce the width of the left navigation in order to allow *content* to expand as follows:

```scss
.container {
  
   ......

    &.collapsed {
      .menu {
        width: 25px;
      }
      
      .content {
        margin-left: 30px;
      }
    }
}
```

## Tablet ## 

In order to achieve the desired functionality we will have to defined the necessary media queries for device sizes as such:

```css
//Phone
@media (max-width: 768px) {
    ....
}

//Tablet
@media (min-width: 768px) and (max-width: 1024px) {
    ....
}

```

Going back to our tablet specification, it states that: by default the navigation have a reduced size and will expand on toggle. 
Compared to the previous **Desktop** definition the tablet display is a **negated state** with the difference that the content size will not change on toggle.

```scss
@media (min-width: 768px) and (max-width: 1024px) {
  .container {
    .content {
      margin-left: 30px;
    }
    
    .menu {
      width: 25px;
    }
  
    &.collapsed {
      .menu {
        width: 100px;
      }
    }
  }
}
```

By default, since our container is missing the collapsed state, we will have to define that the width of the menu has a reduced size (similar to the collapsed one from the Desktop state).
On this state, the content must never change its width. This can be achieved by defining the default *margin-left* property to the content with a reduced size. 
There is no need to define it for the collapsed state due to the fact that the size will be inherited "*as reduced*" from the desktop CSS definition.

On toggle, the menu will need to expand over the content by increasing its width. Because it has an absolute position definition, it will not affect the content container.

## Mobile ##

The mobile design requires to have the menu hidden by default and fully expand it on toggle. 
In order to achieve this we will need to move the menu away from the screen by setting its *margin-left* to a negative width and allow the content to fully expand by reducing its *margin-left* to a minimum padding.
When collapsed, the menu will need to set up his margin to 0 in order to be dragged on the screen.

```scss
@media (max-width: 768px) {
  .container {    
    .content {
      margin-left: 5px;
    }
    
    .menu {
      width: 100px;
      margin-left: -100px;
    }
  
    &.collapsed {
      .menu {
        margin-left: 0px;
      }
    }
      
  }
}
```

By taking advantage of CSS features such as transitions you can move animation responsibility from JS to the CSS engine thus reducing the risk of bugs, blockage of JS execution and improved performance.

