import {airToJs} from '../src'

async function main () {
    let air = `
var a
    
var ob
    num 1
    str "" 
`
    let js = `
let a

let ob = {
    num: 1,
    str: ""
}
`

    const result = await airToJs(air)
    if(result === js){
        console.log("Check air to js completed")
    }else {
        console.error("Check air to js not completed")
        console.log('-----------------------expected\n', js)
        console.log('-----------------------found\n', result)
    }
}

main()