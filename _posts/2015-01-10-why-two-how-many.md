---
layout: post
title:  "Why two and how many (digest cycles)?"
date:   2015-01-10 10:00:00
img: top.png
thumb: mrc-angular.png
categories: 
- blog
- js
- angularjs
---
The digest cycle is responsible for rendering the view based on template scope and controller logic. AngularJS digest
cycle will be executed once an event was triggered on the page or at a specified time interval. The cycle will be ran
as many times ad the iterator will identify no dirty flag set as true.

For more details considering the following example:

Template:
{% highlight html %}

<div>{% raw %}{{message}}{% endraw %}</div>
<div>Processed message is: {% raw %}{{getProcessedMessage()}}{% endraw %}</div>
<div>Fun stuff: {% raw %}{{funContent}}{% endraw %}</div>

{% endhighlight %}

Controller:
{% highlight js %}
 $scope.message = 'message';
$scope.funContent = 'fun';
$scope.getProcessedMessage = function() {
  return "("+$scope.message+")";
}
{% endhighlight %}

After a number of two digest cycles you will end up with the following (desired) output:
{% highlight html %}
message
Processed message is: (message)
Fun stuff: fun
{% endhighlight html %}


For each DOM element that contains a binding to the AngularJS scope a new watcher will be
registered in the $$watchers variable of the current $scope.
![Adding watcher](/resources/images/mintwo/register_watcher.gif)

Every watcher will store the last value returned for the previous digest cycle in order to check future values. A new
digest cycle will be required if at least one of the watcher will have different last and current values. For our small
example three watchers will be registered. The stored values will be the actual content of the parent DOM element (this
is the reason why the second listener will store: **Processed message is: (message)** )

At initialization, for the first cycle, all watchers will have the last value stored as undefined. This will mark the
first digest cycle as dirty and will require a new run. For the second run, since nothing triggered any change in the
resulted evaluated values, all last and current values will be equal, marking the end of the digest cycle.

**Iteration 1:**

| Last value    | Current Value                   |  Dirty?  |
| ------------- | ------------------------------- | -------: |
| undefined     | message                         | <span style="color: red">true<span>      |
| undefined     | Processed message is: (message) | <span style="color: red">true<span>      |
| undefined     | Fun stuff: fun                  | <span style="color: red">true<span>      |

**Iteration 2:**

| Last value                      | Current Value                   |  Dirty?  |
| ------------------------------- | ------------------------------- | -------: |
| message                         | message                         | false    |
| Processed message is: (message) | Processed message is: (message) | false    |
| Fun stuff: fun                  | Fun stuff: fun                  | false    |


**Rendered output:**
{% highlight html %}
message
Processed message is: (message)
Fun stuff: fun
{% endhighlight %}

![Adding watcher](/resources/images/mintwo/iterations.gif)

Consider changing the controller as follows:

{% highlight js %}
var a = 0;
$scope.message = 'message';
$scope.funContent = 'fun';
$scope.getProcessedMessage = function () {
    var result;
    if (++a < 3) {
        $scope.funContent = $scope.funContent+ ' ' +a;
        result = "(" + $scope.message + "[" + a + "])";
    } else {
        result = $scope.message;
    }
    console.log(a, result)
    return result;
}

--------------------------[ Console output ]--------------------------
1 (message[1])
2 (message[2])
3 message
4 message
{% endhighlight %}


Rendered page:

{% highlight html %}
message
Processed message is: message
Fun stuff: fun 1 2
{% endhighlight %}

For this example, the initial digest cycle will be executed four times in order to render the page.  Since function
execution will return a different output and also alters the value of the **funContent** scope variable,
the digest cycles will have to run multiple times in order to avoid display data inconsistency.

**Iteration 1:**

| Last Value | Current Value | Dirty |
| ---------- | ------------- | ----- |
| undefined | message | <span style="color: red">true<span> |
| undefined | Processed message is: (message[1]) | <span style="color: red">true<span> |
| undefined | fun 1 | <span style="color: red">true<span> |

**Iteration 2:**

| Last Value | Current Value | Dirty |
| ---------- | ------------- | ----- |
| message | message | false |
| Processed message is: (message[1]) | Processed message is: (message[2]) | <span style="color: red">true<span> |
| fun 1 | fun 1 2 | <span style="color: red">true<span> |

**Iteration 3:**

| Last Value | Current Value | Dirty |
| ---------- | ------------- | ----- |
| message | message | false |
| Processed message is: (message[2]) | Processed message is: (message) | <span style="color: red">true<span> |
| fun 1 2 | fun 1 2 | false |

**Iteration 4:**

| Last Value | Current Value | Dirty |
| ---------- | ------------- | ----- |
| message | message | false |
| Processed message is: (message) | Processed message is: (message) | false |
| fun 1 2 | fun 1 2 | false |

If one of the function will return different value for each digest cycle evaluation, the process will stop after 11
iterations with the infinite exception. Here is an example that will trigger an exception to be thrown:

{% highlight js %}
 $scope.message = 'message';
$scope.funContent = 'fun';
$scope.getProcessedMessage = function() {
  return Math.random();
}
{% endhighlight %}
