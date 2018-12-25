import {LearningStateHandlerArgs, LearningStateMachine} from "../../StateMachine";
import {SyntaxDefinitions, SyntaxStore} from "./types";

export default function (tokenName: string, bot: LearningStateMachine<SyntaxStore>, syntaxDefinitions: SyntaxDefinitions) {
    let defined = syntaxDefinitions[tokenName]
    const {have, key, as} = defined

    if(!have) {
        return false
    }

    if(key) {
        bot.learn(tokenName, key, ({store, machine, item}: LearningStateHandlerArgs<SyntaxStore>) => {
            store.branch = {
                type: tokenName,
                item,
                tree: []
            }
        })
    }

    if(as) {
        bot.learn(tokenName, ({store, item, machine}) => {
            if(machine.isKnow(as, item)) {
                store.branch = {
                    type: tokenName,
                    item,
                    tree: []
                }
                return tokenName
            }
            return false
        })
    }


    bot.on(tokenName, ({store, machine, item}) => {
        if (!store.branch.tree) {
            throw new Error(`[${tokenName}] not have tree in current branch`)
        }

        let token = have[store.branch.tree.length]
        if (token) {
            let result = machine.isKnow(token, item)
            console.log(`[${tokenName}] isKnow token: ${token}, item: ${item.value}, result: ${result}`)

            if (result) {
                store.branch.tree.push({
                    type: result,
                    item,
                    end: true
                })
            }
        }

        if (store.branch.tree.length >= have.length && store.branch.tree.every(x => !!x.end)) {
            console.log("end", tokenName, 'on', item.value)
            store.tree.push(store.branch)
            store.branch = {tree: []}
            machine.pop()
        }

    })

    return true
}