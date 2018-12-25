import {LearningStateMachine} from "../../StateMachine";
import {SyntaxDefinitions, SyntaxStore} from "./types";
import {isToken} from "../../tokens";

export default function (tokenName: string, bot: LearningStateMachine<SyntaxStore>, syntaxDefinitions: SyntaxDefinitions) {
    const defined = syntaxDefinitions[tokenName]

    let {zeroOrMore, oneOrMore, end} = defined
    if(!zeroOrMore && !oneOrMore) {
        return false
    }

    if(!end) {
        throw new Error(`[${tokenName}] Await field "end" after field "zeroOrMore" or field "oneOrMore"`)
    }

    let more = zeroOrMore as string[]

    if(oneOrMore){
        more = oneOrMore
    }

    bot.learn(tokenName, (args) => {
        const {store, machine, item} = args
        console.log(`[${tokenName}] more`, item.value)

        if(!store.branch.tree){
            store.branch.tree = []
        }

        store.branch.tree.push({
            type: tokenName,
            item,
            end: false,
            tree: []
        })

        machine.nextState(tokenName)

        const state = machine.states[tokenName]

        state(args)
        return false
    })

    bot.on(tokenName, ({store, item, machine}) => {
        console.log(`[${tokenName}] more state on`, item.value)
        if(!store.branch.tree || !store.branch.tree.length){
            throw new Error(`[${tokenName}] Not have branch inside tree on "${item.value}"`)
        }
        let branch = store.branch.tree[store.branch.tree.length - 1]

        let result
        for(let token of more) {
            result = machine.isKnow(token, item)
            if(result){
                console.log(`[${tokenName}] more`, item.value, 'result', result)
                break
            }
        }

        if(oneOrMore && !result && (!branch.tree || !branch.tree.length)){
            throw new Error(`[${tokenName}] Not have tokens when at least one required: ${item.value}`)
        }

        if(!branch.tree){
            throw new Error(`[${tokenName}] Not have tree in current branch on "${item}"`)
        }

        if(result) {

            branch.tree.push({
                type: result,
                item,
                end: true
            })
        }

        if (isToken(item) && item.value === end) {
            console.log(`[${tokenName}] end state on`, item.value, 'where store', store)
            branch.end = true
            machine.pop()
        }
    })

    return true
}