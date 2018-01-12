
export default function (core) {
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
    if(core(air).toJS() === js){
        console.log("Check to js completed")
    }else {
        console.error("Check to js not completed")
    }
}