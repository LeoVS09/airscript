import {airToJs} from '../src'

async function main () {
    let air = `
var a 1

var n -42
var rol true

var tada -Infinity
var pop 55.4

var tadada "eefe \\"fe"
var aga 'df \\'dfdf'

var ob
    num 1
    str "" 
`
    let js = `
let a = 1 // INTEGER

let n = -42 // INTEGER
let rol = true // BOOLEAN

let tada = -Infinity // INFINITY
let pop = 55.4 // FLOAT

let tadada = "eefe \\"fe" // STRING
let aga = 'df \\'dfdf' // STRING

let ob = {
        num: 1 // INTEGER
        str: "" // STRING
}
`

    const result = await airToJs(air, true)
    if(result === js){
        console.log("Check air to js completed")
    }else {
        console.error("Check air to js not completed")
        console.log('-----------------------expected\n', js)
        console.log('-----------------------found\n', result)
    }
}

main()