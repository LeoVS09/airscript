import {LearningStateHandlerArgs, LearningStateMachine} from "../../stateMachine";
import {SyntaxDefinitions, SyntaxStore} from "./types";
import {isToken} from "../../tokens";
import {getLastStoreItem, getLastTreeItem, pushToStore} from "./store";

export default function (tokenName: string, bot: LearningStateMachine<SyntaxStore>, syntaxDefinitions: SyntaxDefinitions) {
    let defined = syntaxDefinitions[tokenName]
    let {after} = defined

    if(!after) {
        return false
    }

    const lastAfter = after.pop()
    const reversedAfter = after.reverse()

    bot.learn(tokenName, ({item, itemHistory, machine, branch}: LearningStateHandlerArgs<SyntaxStore>) => {
        console.log(`[${tokenName}] learn item: ${item.value}`)
        // TODO: refactor
        if (isToken(item) && lastAfter !== item.value) {
            return false
        }

        for (let i = 0; i < reversedAfter.length; i++) {
            const historyItem = itemHistory[itemHistory.length - i - 1]
            const afterItem = reversedAfter[i]

            if (isToken(item) && historyItem.value !== afterItem) {
                console.log(`[${tokenName}] expected ${afterItem}, but got ${historyItem}`, itemHistory)
                return false
            }
        }

        console.log(`[${tokenName}] learn item: ${item.value} - ok`)

        const newBranch = {
            type: tokenName,
            item,
            tree: [],
            end: false
        }

        if(branch.item && branch.tree){
            branch.tree.push(newBranch)
        } else {
            Object.assign(branch, newBranch)
        }

        machine.nextState(tokenName)

        return false
    })

    const {have, end, zeroOrMore, oneOrMore} = defined
    if (!have && !zeroOrMore && !oneOrMore) {
        throw new Error(`[${tokenName}] Expected one of field "have", "zeroOrMore", "oneOrMore" after field "after"`)
    }

    bot.on(tokenName, ({item, machine, branch}: LearningStateHandlerArgs<SyntaxStore>) => {
        console.log(`On [${tokenName}] item: ${item.value}`)

        if (!branch.tree) {
            throw new Error(`[${tokenName}] not have tree in branch inside`)
        }
        let result

        if(have) {
            let token = have[branch.tree.length % have.length]
            console.log(`On [${tokenName}] have:`, have, 'token:', token, 'branch tree:', branch.tree)
            result = machine.isKnow(token, item)
        } else if(zeroOrMore) {
            for(let token of zeroOrMore) {
                result = machine.isKnow(token, item)
                if(result){
                    break
                }
            }
        } else if(oneOrMore) {
            for(let token of oneOrMore) {
                result = machine.isKnow(token, item)
                if(result){
                    break
                }
            }
            if(!result) {
                throw new Error(`[${tokenName}] Not have tokens when at least one required: ${item.value}`)
            }
        }

        if (result) {
            branch.tree.push({
                type: result,
                item,
                end: true
            })
        }

        if (end) {

            if (isToken(item) && item.value === end) {
                console.log('end', tokenName, 'item', item.value)
                branch.end = true
                machine.pop()
            }
            return
        }

        if(have) {
            if (branch.tree.length >= have.length && branch.tree.every(x => !!x.end)) {
                branch.end = true
                machine.pop()
            }
        }
    })

    return true
}