import {LearningStateHandlerArgs, LearningStateMachine} from "../../../stateMachine";
import {SyntaxDefinitions, SyntaxStore} from "../types";

export default function (tokenName: string, bot: LearningStateMachine<SyntaxStore>, syntaxDefinitions: SyntaxDefinitions) {
    let defined = syntaxDefinitions[tokenName]
    const {have, key, as} = defined

    if(!have) {
        return false
    }

    if(key) {
        bot.learn(tokenName, key, ({branch, machine, item}: LearningStateHandlerArgs<SyntaxStore>) => {
            Object.assign(branch, {
                type: tokenName,
                item,
                tree: [],
                end: false
            })
        })
    }

    if(as) {
        bot.learn(tokenName, ({branch, item, machine}) => {
            if(machine.isKnow(as, item)) {
                Object.assign(branch, {
                    type: tokenName,
                    item,
                    tree: [],
                    end: false
                })
                return tokenName
            }
            return false
        })
    }


    bot.on(tokenName, ({branch, machine, item}) => {
        if (!branch.tree) {
            throw new Error(`[${tokenName}] not have tree in current branch`)
        }

        let token = have[branch.tree.length]
        if (token) {
            let result = machine.isKnow(token, item)
            console.log(`[${tokenName}] isKnow token: ${token}, item: ${item.value}, result: ${result}`)

            if (result) {
                branch.tree.push({
                    type: result,
                    item,
                    end: true
                })

                console.log(`[${tokenName}] branch`, branch)
            }
        }

        if (branch.tree.length >= have.length && branch.tree.every(x => !!x.end)) {
            console.log("end", tokenName, 'on', item.value, 'branch', branch)
            branch.end = true
            machine.pop()
        }

    })

    return true
}