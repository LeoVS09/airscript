# airscript
simple js dialect 

## TODO
+ add type system
+ add auto writing
+ add type auto determination
+ add TypeScript support
+ add state machine declaration and usage
---
### Variables and object declaration
```air
// air
var a

var ob
    num 1
    str ""
```

```js
// js
let a

let ob = {
  num: 1,
  str: ""  
}
```
---
### Function declaration and usage
```air
// air
function display a and b
    console.log a and b

display 1 and "lol"
```

```js
// js
function display(a, b) {
  console.log(a,b)
} 

display(1, "lol")
```
---
### Promise and async
```air
// air

get url
    then parse
    then display

// or

get url then parse then display

async function parse data
    // do something
```

```js
// js

get(url)
  .then(parse)
  .then(display)

async function parse(data) {
  // do something
}
```

class declaration and usage
```air
// air

class A
    constructor value
        set value
        // or remember value
        // or this value = value
    
    method get value
        return remembered value
        // or return this value

    method set value 
         remember value
    
var a is new A
// or var a = new A

a set value "kek"
// or
// var value = "kek"
// a set value 

console log a get value // kek
     
```

```js
// js

class A{
  constructor(value){
    this.value = value
  }
  
  getValue(){
    return value
  }
  
  setValue(value){
    this.value = value
  }
}

let a = new A

a.setValue("kek")

console.log(a.getValue()) // kek

```
