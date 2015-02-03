# clan
_Yet another inheritance module_

## Install
```shell
npm install clan
```

## Usage
Clan has a very simple API of Classical inheritance and Mixins.

### Classical inheritance
For Classical inheritance just call the `clan` function with your object class definition -
```javascript
var clan = require('clan');

var personClass = clan({
    name : 'Alice',
    sayHello: function () {
        conosle.log('Hello, I\'m ' + this.name);
        return this;
    }
});
```

Notice that this define our personClass but to use it we need to create Instantiate an object using the `create` method.

```javascript
var alice = personClass.create();
alice.sayHello(); //Hello, I'm Alice
```

the create method calls the `init` method on our new object so we can rewrite personClass to have a constructor that will set our person name
```javascript
var personClass = clan({
    init: function (name) {
        this._super();
        this.name = name;
        return this;
    },
    name : 'Alice',
    sayHello: function () {
        conosle.log('Hello, I\'m ' + this.name);
        return this;
    }
});

var bob = personClass.create('Bob');
bob.sayHello(); //Hello, I'm Bob
```

Cool but whats that `_super` method ?
for every method we extend on our parent Class `this._super` will call the original method of the parent, so we can easily reuse logic.
In this case we are using the base `init` of clan since it's doing some useful checks and cleans our object, in fact the base `init` first parameter is an object that override our class parameters so for changing our name we don't even need to have a custom `init` method, and this will also work -

```javascript
var personClass = clan({
    name    : 'Alice',
    sayHello: function () {
        conosle.log('Hello, I\'m ' + this.name);
        return this;
    }
});

var bob = personClass.create({ name: 'Bob'});
bob.sayHello(); //Hello, I'm Bob
```

One last thing about Classes, once we have a class we can extend it using the `extend` method
```javascript
var texanClass = personClass.extend({
    sayHello: function () {
        conosle.log('Howdy, I\'m ' + this.name);
        return this;
    }
});
var carol = texanClass.create({ name: 'Carol'});
carol.sayHello(); //Howdy, I'm Carol
console.log(carol instanceof texanClass); //true
console.log(carol instanceof personClass); //true
```
Notice that we can use `instanceof`  to test if our object inherits from any class in its prototype chain.

As before we can use the `_super` method in child class -
```javascript
var pirateClass = personClass.extend({
    sayHello: function () {
        this._super();
        conosle.log('Arrr');
        return this;
    }
});
var dave = pirateClass.create({ name: 'Dave'});
dave.sayHello(); //Howdy, I'm Dave Arrr
```

### Mixins
To create a new mixin call the `mixin` method  on `clan` function with your mixin definition -
```javascript
var clan = require('clan');

var swordMix = clan.mixin({
    attack: function () {
        console.log('woosh woosh');
        return this;
    }
});
```

Mixins adds to an existing Object.
So if we want to add sword fighting ability into `dave` from our last example
```javascript
swordMix(dave)
console.log(dave.attack());  //woosh woosh
```

We extend mixns from existing mixins using the `mixin` method
```javascript
var ambushMix = swordMix.mixin({
    hide: function () {
        console.log('');
        return this;
    }
});
```

So if we add ambush ability into `Carol` she cn now
```javascript
ambushMix(carol)
carol.hide().attack();  // /*silence*/ woosh woosh
```

As with Classical inheritance we can use `_super` method to access method on the parent we extended



