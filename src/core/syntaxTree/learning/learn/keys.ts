import {LearningStateHandlerArgs, LearningStateMachine} from "../../../stateMachine";
import {SyntaxDefinitions, SyntaxStore} from "../types";
import {isToken} from "../../../tokens";

export default function (tokenName: string, bot: LearningStateMachine<SyntaxStore>, syntaxDefinitions: SyntaxDefinitions) {

    const defined = syntaxDefinitions[tokenName]
    const {key, is, as, maybe, like} = defined

    if (key) {
        bot.learn(tokenName, key)
        return
    }

    if(is) {
        bot.learn(tokenName, ({item}: LearningStateHandlerArgs<SyntaxStore>) => {
            if(isToken(item)) {
                return item.value === is
            }
            return false
        })
        return
    }

    if (as) {
        bot.learn(tokenName, ({item, machine}) => {
            if(machine.isKnow(as, item)) {
                return tokenName
            }
            return false
        })

        return
    }

    if (maybe) {

        bot.learn(tokenName, ({machine, item}: LearningStateHandlerArgs<SyntaxStore>) => {
            console.log(`[${tokenName}] maybe`, item.value)

            for (let token of maybe) {
                const result = machine.isKnow(token, item)
                if (result) {
                    return result
                }
            }

            return false
        })

        return
    }


    if(like) {
        bot.learn(tokenName, ({store, item, machine}: LearningStateHandlerArgs<SyntaxStore>) => {
            const result = machine.isKnow(like, item)
            console.log(`[${tokenName}] like: ${like}, item: ${item.value}, result: ${result}`)
            return result
        })

        return
    }
}