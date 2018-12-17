# airscript
I Had Strings, But now i'm free...

## TODO
+ add type system
+ add auto writing
+ add type auto determination
+ add TypeScript support
+ add state machine declaration and usage
+ fix isKnow in StateMachine, better use tokens which not be strings
+ add end line characters
---
### Variables and object declaration
```air
// air
var a

var you = "cool"

var alpha = true

var ob
    num 1
    str ""
    
// or
var ob =
    num 1
    str ""
```

```js
// js
let a

let you = "cool"

let alpha = true

let ob = {
  num: 1,
  str: ""  
}
```
---
### Function declaration and usage
```air
// air
function display a b
    console.log a b

display 1 "lol"
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

### class declaration and usage
```air
// air

class Human
    constructor firstName secondName password
        set firstName
        
        // experimental
        remember secondName
        
        this password = password
    
    method compude fullName       
        // may be not use this? 
        // possible hard to read when method is long
        var fullName = this firstName + ' ' + this secondName
        // or
        var fullName = this fistName ' ' this secondName
        
        return fullName
    
    get login
        // experimental
        return remembered firstName
        
        // or 
        return this firstName       

    set login 
        // experimental
        remember login as firstName
        
        // or 
        this firstName = login
    
var human is new Human "James" "Bond" "007"
// experimental 
var human new Human "James" "Bond" "007"

// or 
var human = new A "James" "Bond" "007"

human firstName = "kek"

// or
var firstName = "kek"

// experimental
a remember firstName 

a login = "Sam"

console log a compude fullName // Sam Bond
     
```

```js
// js

class Human {
  constructor(firstName, secondName, password){
    this.firstName = firstName    
    this.secondName = secondName   
    this.password = password
  }
  
  compudeFullName(){
    return this.firstName + ' ' + this.secondName
  }
  
  get login(){
    return this.firstName
  }
  
  set login(value) {
    this.firstName = value
  }
}

let human = new Human("James", "Bond", "007")

human.firstName = "kek"

let firstName = "kek"

a.firstName = firstName

a.login = "Sam"

console.log(a.compudeFullName) // Sam Bond

```

### Condition
```air
var a = 1

if a < 5
    a = 10
else 
    a = 11

// a == 11

a = 20 if a > 5

// a == 20

console log if a == 1 
        5
    else 
        a
```

```js
var a = 1

if(a < 5) {
    a = 10
} else {
    a = 11
}

// a == 11

if(a > 5){
 a = 20
}

// a == 20

console.log( a == 1 ? 5 : a)
```


### Chained Comparisons
```air
var year = 2030

if 2018 < year < 2050 
    console log "It's our time!"    
```

```js
let year = 2030

if (2018 < year && year < 2050) {
    console.log("It's our time!")
}
```

### Piping

```air
var list = 0, 1, 2, 3, 4

var result = list
    map x => x * 2
    filter x => x < 3
    sum
    
console log result    
```

```js
var list = [0, 1, 2, 3, 4]

var result = list
    .map(x => x * 2)
    .filter(x => x < 3)
    .reduce((result, x => x + result), 0)
    
console.log(result)
```
### Modules
```air
// some.air
export function a add b
    return a + b
    
// main.air
import add from 'some.air'

console log 1 add 2 // 3
```

### Error handling
```air
function sum ...nums
    var result = 0
    
    for n of nums
   
        if n is not number
            return fail
            
        result += n
    
    return result

    
console log sum 1, 2, 3 // 6

const result = sum 1, 'x', 3
    on fail 'Error handlet'

console log result // Error handlet

function sumAndMultiply operand ...nums
    var result = sum ...nums
        on fail
            return 1
     
     return result * operand

console log sumAndMultiply 2, 1, 'text', 3 // 1
    
        
```
```js
function sum (...nums) {
    let result = 0
    
    for n of nums {   
        if n is not number
            return { result: null, ok: false}
            
        result += n
    }
    
    return { result, ok: true } 
}

    
console.log(sum(1, 2, 3)) // 6

const {result, ok} = sum( 1, 'x', 3)
if(!ok)
    result = 'Error handlet'

console.log(result) // Error handlet

function sumAndMultiply(operand, ...nums) {
    var {result, ok} = sum(...nums)
    if(!ok)
        return 1
     
     return result * operand
}

console.log(sumAndMultiply(2, 1, 'text', 3)) // 1
```

### Pipes / Streams / Chanels
```air

readableFile -> writebleFile

const arr = [1, 2, 3]
var clone = []

arr -> clone

console log clone // [1, 2, 3]

function displayNumber n
    console log n

arr -> displayNumber
    // 1
    // 2
    // 3

function increase x
    return x + 1

arr -> increase -> displayNumber
    // 2
    // 3
    // 4

```

```js
readableFile.pipe(writebleFile)

const arr = [1, 2, 3]
var clone = []

arr.forEach(n => arr.push(n))

console.log(clone) // [1, 2, 3]

function displayNumber(n) {
    console.log(n)
}

arr.forEach(n => displayNumber(n))
    // 1
    // 2
    // 3
    
function increase(x) {
    return x + 1    
}

arr
    .map(x => increase(x))
    .forEach(n => displayNumber(n))
```
