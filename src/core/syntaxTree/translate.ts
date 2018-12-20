import {constants as tokens, isToken} from '../tokens'
import {LearningStateMachine, LearningStateHandlerArgs, LearningStateHandler, LearningItem} from '../StateMachine'

export interface SyntaxDefinitions {
    [token: number]: {
        key?: string | RegExp | LearningStateHandler<SyntaxStore>
        have?: Array<string>
        maybe?: Array<string>
        after?: Array<string>
        next?: string
        end?: string
        like?: string
        is?: string
        as: string
        zeroOrMore?: Array<string>
        oneOrMore?: Array<string>
    }
}

export interface SyntaxField {
    key: string
    value: string
}

export interface SyntaxBranch {
    token?: string
    type?: string
    tree?: Array<SyntaxBranch>
    value?: string
    item?: LearningItem
    branch?: SyntaxBranch
    fields?: Array<SyntaxField>
    end?: boolean
}

export interface SyntaxStore {
    tree: Array<SyntaxBranch>
    branch: SyntaxBranch
}

export default function (syntaxDefinitions: SyntaxDefinitions): LearningStateMachine<SyntaxStore> {
    let store = createStore()

    let bot = new LearningStateMachine<SyntaxStore>(start, store)

    teach(bot, syntaxDefinitions)

    console.log('Learned states:\n', bot.states)

    return bot
}

function createStore(): SyntaxStore {
    return {
        tree: [],
        branch: {
            token: '',
            tree: []
        }
    }
}

function teach(bot: LearningStateMachine<SyntaxStore>, syntaxDefinitions: SyntaxDefinitions) {
    for (let tokenName in syntaxDefinitions) {
        let defined = syntaxDefinitions[tokenName]

        if (defined.key) {
            bot.learn(tokenName, defined.key as string)
        } else if(defined.is) {
            bot.learn(tokenName, ({item}: LearningStateHandlerArgs<SyntaxStore>) => {
                if(isToken(item)) {
                    return item.value === defined.is
                }
                return false
            })
        } else if (defined.as) {
            bot.learn(tokenName, ({item, machine}) => {
                if(machine.isKnow(defined.as, item)) {
                    return tokenName
                }
                return false
            })
        } else if (defined.maybe) {
            let maybe = defined.maybe

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
        }

        if (defined.after) {
            let {after} = defined
            const lastAfter = after.pop()
            after = after.reverse()

            bot.learn(tokenName, ({item, itemHistory, machine, store}: LearningStateHandlerArgs<SyntaxStore>) => {
                console.log(`[${tokenName}] learn item: ${item.value}`)
                // TODO: refactor
                if (isToken(item) && lastAfter !== item.value) {
                    return false
                }

                for (let i = 0; i < after.length; i++) {
                    const historyItem = itemHistory[itemHistory.length - i - 1]
                    const afterItem = after[i]

                    if (isToken(item) && historyItem.value !== afterItem) {
                        console.log(`[${tokenName}] expected ${afterItem}, but got ${historyItem}`, itemHistory)
                        return false
                    }
                }

                console.log(`[${tokenName}] learn item: ${item.value} - ok`)

                if (!store.branch.tree) {
                    throw new Error(`[${tokenName}] not have tree in current branch`)
                }

                store.branch.tree.push({
                    type: tokenName,
                    item,
                    tree: [],
                    end: false
                })

                machine.nextState(tokenName as string)

                return false
            })

            const {have, end, zeroOrMore, oneOrMore} = defined
            if (!have && !zeroOrMore && !oneOrMore) {
                throw new Error(`[${tokenName}]Expected one of field "have", "zeroOrMore", "oneOrMore" after field "after"`)
            }

            bot.on(tokenName as string, ({item, machine, store}: LearningStateHandlerArgs<SyntaxStore>) => {
                console.log(`On [${tokenName}] item: ${item.value}`)
                if (!store.branch.tree) {
                    throw new Error(`[${tokenName}] not have tree in current branch`)
                }

                let branch = store.branch.tree[store.branch.tree.length - 1]
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

            continue
        }

        if (defined.have) {

            if(defined.key) {
                bot.learn(tokenName, defined.key as string, ({store, machine, item}: LearningStateHandlerArgs<SyntaxStore>) => {
                    store.branch = {
                        type: tokenName,
                        tree: []
                    }
                })
            }

            if(defined.as) {
                bot.learn(tokenName, ({store, item, machine}) => {
                    if(machine.isKnow(defined.as, item)) {
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

            const {have} = defined
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
            continue
        }

        if(defined.zeroOrMore || defined.oneOrMore) {
            let {zeroOrMore, oneOrMore, end} = defined
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
        }

        if (defined.like) {
            bot.learn(tokenName, ({store, item, machine}: LearningStateHandlerArgs<SyntaxStore>) => {
                const result = machine.isKnow(defined.like as string, item)
                console.log(`[${tokenName}] like: ${defined.like}, item: ${item.value}, result: ${result}`)
                return result
            })
        }


    }
}

function start({store, machine, item}: LearningStateHandlerArgs<SyntaxStore>) {
    if (machine.isKnow(tokens.EMPTY_LINE, item)) {
        return store.tree.push({
            token: tokens.EMPTY_LINE,
            item
        })
    }

    if (machine.isKnow(tokens.VARIABLE, item)) {
        console.log('isKnow', item, 'to', tokens.VARIABLE)
        return machine.nextState(tokens.VARIABLE)
    }

    if(machine.isKnow(tokens.ACTION, item)) {
        console.log('isKnow', item, 'to', tokens.ACTION)
        return machine.nextState(tokens.ACTION)
    }

    if(machine.isKnow(tokens.FUNCTION_DEFINITION, item)) {
        console.log('isKnow', item, 'to', tokens.FUNCTION_DEFINITION)
        return machine.nextState(tokens.FUNCTION_DEFINITION)
    }

    console.error('[UNEXPECTED TOKEN]', item)

}

