---
layout: post
title:  "Distributed Machine Learning using GunDB"
date:   2016-08-02 10:00
img: art-inf-generic.png
thumb: mrc-css.png
categories: 
- blog
- artificial intelligence
- particle swarm
- genetic algorithm
- collective knowledge
- machine learning
---

# GunDB #

Sometime ago I came across  **[GunDB](http://gun.js.org/enterprise/)** and, after skimming through the documentation and source code,
I just realized that there are a lot of use cases where this type of storage could solve my problems. 
With the rise of mobile devices and 'mobile first' being a standard, a new requirement rise to challenge the frontend developers: **offline first**.

GunDB is a realtime database of data synchronization - this means that you will no longer have to care about data management on unreliable connection.
Everybody is doing it: Google with docs and email drafts, Microsoft online word editor and basically every application that support offline first - so why shouldn't you do it as well?
All you have to do when using it is to sit back, relax, manipulate the data and let Gun do the syncing work for you. One major advantage of Gun, that I exploited to the maximum, is the ability to notify on data change. 
This feature is a life-saver when it comes to realtime data rendering, notification and decision making.

If you are not interested in machine learning and you are here only to see how GunDB works, jump to the interactive demo on "How it works" and demo Plunker on "GunDB in Artificial Intelligence".

# The birds and the bees of Machine Learning #

The rise of machine learning allowed computers the ability to learn specialized tasks without being preprogrammed to do it. 
Here is a sample of classic particle swarm optimization, where the entire swarm learn where the optimum (*best feeding area*) is located.
Just click on **Start** button and see how multiple swarms converge to their belief of best area. The algorithm used is a slowed down classic Particle Swarm algorithm.

<iframe src="https://run.plnkr.co/plunks/SOd9dC/" style="width: 100%; height: 400px"></iframe>

If you start tinkering with the population size and *reset* the evolution, you will notice that for large population sizes **>500** the swarm will converge to the same point almost everytime.
When using small sized swarms 10 to 40, the swarms will converge in different points because there is not enough *knowledge* about the surroundings to atract the particles.


NP-Hard problems usually have a huge searching area and exhaustive searches are not an option. 
The problem presented above is a classical benchmark problem: Schwefel, used in evaluating performance of optimization algorithms (particle swarm, genetic, simmulated annealing etc.).
The problem has a 2D searching space where the minimum (best feeding area) is located in the top left corner. 
With every position change, each particle must be re-evaluated to check if they have a better value than previous or than globally known one  - In our case a smaller Schwefel function value.

<img class="img-responsive" src="{{ '/assets/img/schwefel-normalized.png'}}">
<div class="text-center">Schwefel function representation</div>

On NP-Hard problems - such as evaluation of natural language in parsing texts or voice transcripts - this evaluation is rather costly and requires a huge amount of processing power.
In order to evaluate, tweak and understand how such algorithm performs on process intensive problems, small population of swarms are used, reducing the chance of introducing diversity within the searching space.

# How it works #

With each iteration the entire swarm migrates towards the location of the best particle (in this example, the best particle is one closest to the black circle - click to move).
With movement, each particle gains momentum that will allow it to move further than the target point due to inertia. 
This inertia offers the chance to search for a better space further than the current global best particle. 
In order to fully understand how the swarm is behaving you can use the simulator below. 
Just click anywhere in the sandbox to set the global best and click on **Start** button to allow the particles to start searching the area.
After most of the particles lost momentum change the location of the global best by clicking in another region of the sandbox.
You will notice that since the particles will no longer swarm towards the global best due to the lost momentum.
Now click on **Random Particle** button and see how a newly inserted individual will affect the swarm.

<div style="text-align:center">
    <svg style="border: 1px solid #000" id="attractor" width="100%" height="300" xmlns="http://www.w3.org/2000/svg">
     <!-- Created with Method Draw - http://github.com/duopixel/Method-Draw/ -->
     <g>
      <title>background</title>
      <rect fill="#fff" id="canvas_background" height="202" width="322" y="-1" x="-1"/>
      <g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">
       <rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%"/>
      </g>
     </g>
     <g >
      <title>Layer 1</title>            
      
     </g>
    </svg>
    
    <button id="restart">Restart</button>
    <button id="start">Start</button>
    <button id="step">Step</button>
    <button id="random">Random Particle</button>
   
</div>
<script>
var omega = 0.85;
var c1 = 0.1;
var c2 = 0.1;

document.addEventListener("DOMContentLoaded", function (event) {

    var toX = Math.round(Math.random() * 300);
    var toY =  Math.round(Math.random() * 300);
  
    var attractor = document.createElementNS("http://www.w3.org/2000/svg", 'ellipse'); //Create a path in SVG's namespace
    
    attractor.style.strokeWidth = "1px"; //Set stroke width
    attractor.setAttribute('cx', toX);
    attractor.setAttribute('cy', toY);
    attractor.setAttribute('velX', 0);
    attractor.setAttribute('velY', 0);
    attractor.setAttribute('stroke', '#000000');
    attractor.setAttribute('fill', '#FFFFFF');
    attractor.setAttribute('rx', 10);
    attractor.setAttribute('ry', 10);
    document.getElementById('attractor').appendChild(attractor);
    
    function addRandom() {
        var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'ellipse'); //Create a path in SVG's namespace
        // newElement.style.stroke = "#000"; //Set stroke colour
        newElement.style.strokeWidth = "1px"; //Set stroke width
        newElement.setAttribute('cx', Math.round(Math.random() * 300));
        newElement.setAttribute('cy', Math.round(Math.random() * 300));
        newElement.setAttribute('velX', 0);
        newElement.setAttribute('velY', 0);
        newElement.setAttribute('fill', '#FF0000');
        newElement.setAttribute('stroke', '#000000');


        newElement.setAttribute('rx', 3);
        newElement.setAttribute('ry', 3);
        document.getElementById('attractor').appendChild(newElement);

        refs.push(newElement);
    }

    var refs = [];
    for (var i = 0; i < 10; i++) {
        addRandom();
    }

    function step() {

        var who = 0;
        var opt = 1e12;

        for (var i = 0; i < refs.length; i++) {
            var elem = refs[i];
            var localX = Number(elem.getAttribute('cx'));
            var localY = Number(elem.getAttribute('cy'));
            var pbVal = Number(elem.getAttribute('val'));
            var val =
                Math.abs(toX - localX) * Math.abs(toX - localX) +
                Math.abs(toY - localY) * Math.abs(toY - localY);

            if (pbVal < val) {
                elem.setAttribute('pbx', localX);
                elem.setAttribute('pby', localY);
            }

            elem.setAttribute('fill', '#FF0000');
            elem.setAttribute('stroke', '#000000');


            if (val < opt) {
                opt = val;
                who = i;
            }
        }

        var bestX = Number(refs[who].getAttribute('cx'));
        var bestY = Number(refs[who].getAttribute('cy'));

        refs[who].setAttribute('fill', '#00FF00');
        refs[who].setAttribute('stroke', '#00FF00');

        for (var i = 0; i < refs.length; i++) {

            var elem = refs[i];
            var localX = Number(elem.getAttribute('cx'));
            var localY = Number(elem.getAttribute('cy'));
            var velX = Number(elem.getAttribute('velX'));
            var velY = Number(elem.getAttribute('velY'));
            var pbestX = Number(elem.getAttribute('pbx'));
            var pbestY = Number(elem.getAttribute('pby'));

            velX = omega * velX + (c1 * Math.random() * (pbestX - localX)) + (c2 * Math.random() * (bestX - localX));
            velY = omega * velY + (c1 * Math.random() * (pbestY - localY)) + (c2 * Math.random() * (bestY - localY));

            elem.setAttribute('velX', velX);
            elem.setAttribute('velY', velY);

            elem.setAttribute('cx', localX + velX);
            elem.setAttribute('cy', localY + velY);

        }
    }


    $('#attractor').click(function (event) {
       
        toX = event.offsetX;
        toY = event.offsetY;
        attractor.setAttribute('cx', toX);
        attractor.setAttribute('cy', toY);
       
    });
    
    $("#start").click(function() {
      window.optInterval = setInterval(function () {
            step();
        }, 100);
    });
    
    $("#step").click(function() {
        clearInterval(window.optInterval);
        step();
    });
    
    $("#random").click(function() {
        addRandom();
    });
    
    $("#restart").click(function () {
        clearInterval(window.optInterval);
        for (var i = 0; i < refs.length; i++) {
            elem = refs[i];
            var cx = Math.round(Math.random() * 300);
            var cy = Math.round(Math.random() * 300);
            elem.setAttribute('cx', cx);
            elem.setAttribute('pbx', cx);

            elem.setAttribute('cy', cy);
            elem.setAttribute('pby', cy);

            elem.setAttribute('velX', 0);
            elem.setAttribute('velY', 0);
        }
    });

});
</script>

The role of GunDB in this process is the be the global archive of best individuals, notify the algorithm about a new global best and drive all the distributed swarms.


# GunDB in Artificial Intelligence #

Usually when I ran costly optimizations, I was beginning my day with setting up a large population over a large searching space, hit **Start** button and carry on with usual activities during the day and interpreted the results the next morning.
Using GunDB within this type of applications was a life-changer for me. I was able to run an optimization on my home desktop computer, go to the office, start another one on my mobile and laptop and see how the miracle of collective knowledge behaves.
At that point I was able to use multiple processing units, independent of time, space, internet connection etc. If my mobile would loose the connection for 5 minutes, at the point of reconnect, GunDB was able to sync to *global knowledge*
Another huge advantage was that I was able to run the same search with multiple algorithms: Particle Swarm, Genetic Algorithm etc. and use each one's advantage at the same time.

Here is the same optimization problem that takes advantage of GunDB global knowledge:
<iframe src="https://run.plnkr.co/plunks/0sUJjo/" style="width: 100%; height: 400px"></iframe>

## Gun Integration ##

In order to have everything in sync a Gun server connection must be established.
*Even though the server is not ready, every change will be performed on users local storage and sync on connect*

For better organization, all the data related to the searching algorithm will be stored at *optimisations* key. 

```javascript
var gun = Gun('https://node-myrighttocode.rhcloud.com:8443/gun'),
    optimisations = gun.get('optimisations');
```

The advantage of using GunDB is that you can **act on data change**. 
In order to keep the swarms in sync, on any change of the *shwefel* key value for the *optimisations* data object, the server value (*serverOptimal*) will be stored locally for later checks.
If the server value is equal with 1e10 then this is marked as a global reset event for the swarms and all the running instances will clear their server value, clear the local storage and reset the population.
In this case, GunDB serves as an excellent notification engine for decision making for distributed software instances - with this implementation I was able to clear and restart the instances at home remotely. 


```javascript
optimisations.path('schwefel').on(function(data) {
    
    serverOptimal = data;
    if (data.schwefel === 1e10) {
      window.localStorage.clear();
      application.resetPopulations();
      application.addPopulation(populationSize);
    }
    
  }); 
```

For each evolution cycle the best individual in the swarm is compared to the global best.
If the global best is better than the local best, a new individual in introduced into the swarm thus becoming an atractor. 
If the current local best value is better than global one, the local individual will be pushed to the server and to the rest of distributed swarms.


```javascript
  var best = population.individuals[0].fieldsMap;
  if (!serverOptimal || best.schwefel < serverOptimal.schwefel) {
    
    var localOpt = {
      x: best.x,
      y: best.y,
      schwefel: best.schwefel
    }
    
    //Update server optimal with current best value
    optimisations.path('schwefel').put(localOpt);
  
  } else if (best.schwefel>serverOptimal.schwefel) {

    //Push individual from server into the swarm
    var serverIndividual = population.requestIndividual();
    serverIndividual.setValue('x', serverOptimal.x);
    serverIndividual.setValue('y', serverOptimal.y);
    serverIndividual.setValue('schwefel', serverOptimal.schwefel);
  
  }

```

## Gun API ##

I took the liberty to copy the gun api documentation from the website in order to show the simplicity of interacting with GunDB.
Every method in the API is natural, self explanatory but powerful when it comes to sync. 

- **constructor**: *var gun = Gun(options)* - Used to creates a new gun database instance;
- **gun.put(data, callback)**: Used to creates a new gun database instance;
- **gun.key(name)**: Used to index data for faster searches;
- **gun.get(name)**: Load all data under a key into the context;
- **gun.path(property)**: Navigate through a node’s properties;
- **gun.back**: Move up to the parent context on the chain;
- **gun.on(callback)**: Subscribe to updates changes on a node or property real-time;
- **gun.map(callback)**: Loop over each property in a node, and subscribe to future changes;
- **gun.val(callback)**: Read a full object without subscribing updates;
- **gun.not(callback)**: Handle cases where data can’t be found.
