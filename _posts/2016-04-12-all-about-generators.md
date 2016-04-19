---
layout: post
title:  "All about generators"
date:   2016-04-12 16:00
img: js-es6.png
thumb: thumb-es6.png
categories: 
- blog
- js
- es6
- generators

---

# tldr; #
The basic idea of a generator is that you can pause and resume function 
execution at any point in time. In order to define a generator function
the * character is used to prefix the name or suffix the ```function``` 
keyword. You can go to the bottom of the page to view a Pseudo-Thread
example execution of javascript code using generators.

## Basics ##
Consider the following example - basic and relevant (almost useless) example
of generators:

~~~javascript

function *genFunc1() {
  yield 1;
  yield 2;
  return 3;
}

var generator = new genFunc1();
console.log(generator.next())
console.log(generator.next())
console.log(generator.next())
console.log(generator.next())

//Output
// Object {value: 1, done: false}
// Object {value: 2, done: false}
// Object {value: 3, done: true}
// Object {value: undefined, done: true}

~~~

We have defined a generator function ```*genFunc1() { ... }``` that 
contain only three lines of code. The first two lines are ```yield```(ing)
two values 1 and 2. The keyword is basically pausing the function execution
until the ```next()``` function is called on the generator. The result
of the next function execution is a object containing the value returned
by the ```yield``` keyword and the function progress status. The progress
 status is represented by the ```done``` key that will be set to ```true```
when the function executed the last line of code.

Probably the best usage of the basic example is to get the next item in 
a series (eg. Fibonacci)

~~~javascript

function* fibonacci(){
  var fn1 = 0;
  var fn2 = 1;
  while (true){  
    var current = fn1;
    fn1 = fn2;
    fn2 = current + fn1;
    var reset = yield current;
    if (reset){
        fn1 = 0;
        fn2 = 1;
    }
  }
}
 
var sequence = fibonacci();
console.log(sequence.next().value);     // 0
console.log(sequence.next().value);     // 1
console.log(sequence.next().value);     // 1
console.log(sequence.next().value);     // 2
console.log(sequence.next().value);     // 3
console.log(sequence.next().value);     // 5
console.log(sequence.next().value);     // 8
~~~

This is the best example of the basic usage because it makes use
of ```while(true) { ... }``` that is completely safe within generator
functions. Using this syntax will ensure you that the resulting output
of the ```next()``` function will never have ```done: true``` and "a" result
will always be there when you need it. 

# Getting there #

At this point in time you might think that the generator functions are 
the best thing when generating values for an iterator. One thing to underline
for this feature is that the ```yield``` keyword will pass back the parameter
passed to the ```next()``` function.

Considering the following example: 

~~~javascript

function *genFunc1() {
  var paramA = yield 1;
  var paramB = yield 2;
  console.log(paramA, paramB);
  return 3;
}

var generator = new genFunc1();
console.log(generator.next('Athos'))
console.log(generator.next('Portos'))
console.log(generator.next('Aramis'))

/**
 Output:

Object {value: 1, done: false}
Object {value: 2, done: false}
Portos Aramis
Object {value: 3, done: true}

**/
~~~

You might think that the output of ```console.log(paramA, paramB)``` would be ```Athos Portos``` 
(at least that I did) - but it is not (the result is ```Portos Aramis```). 
This is because the execution of the code is from right to left. 
When executing the first ```next('Athos')``` function the parameter passed *Athos*, will be lost 
with the first ```yield``` pause. Only after resuming the execution using the next 
execution of ```next('Portos')``` variable ```paramA``` will received 
the value passed by the resuming function: *Portos*

# The *Promise* killer #

You might have heard that the generators are the next Promise(s) - but it
is not quite true. Yes, one of the most exciting usage of generators is
to make async code look synchronous but they are still taking advantage
of the wonder of Promises. 

~~~javascript

function doRequest(url) {
    return ajaxCall( url, function(response){
        it.next( response );
    });
}

function *main() {
    var user = yield doRequest( "http://yourdomain/api/v1/user" );
    var roles = yield doRequest( "http://yourdomain/api/v1/roles" );
    console.log("The user", user, "has the following roles", roles);
}

var it = main();
it.next(); 

~~~

Looking at the ```*main``` function seems like one of the first piece
of async code that I have written without using generators that, of course,
it failed. But with generators we can force the function to wait for the response 
of the first response to be fetched. The whole execution starts with the call
of ```it.next()``` function that will trigger the first ```doRequest``` of users
api. When the result from the users API will be received, the AjaxCall callback 
is executed thus unpausing the execution of our generator and passing the result
as parameter. The execution is continued with the assignment of the result 
to the user variable and the call to the roles API.

# It can get better #

Here is a sample implementation of javascript pseudo-thread mechanism using
generators. The example is using generators to execute running functions
and pauses from time to time to allow the browser to draw the DOM. 
A huge advantage of this approach is that it is non-blocking. 

Have Fun!

<iframe src="https://embed.plnkr.co/Z1EY4pZ8DbizYIZO9yHN/" style="width: 100%; height: 300px"></iframe>