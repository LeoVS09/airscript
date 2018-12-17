import {constants as tokens} from '../tokens'
import {LearningStateMachine, LearningStateHandlerArgs, LearningStateHandler, LearningItem} from '../StateMachine'

export interface SyntaxDefinitions {
    [token: number]: {
        key?: string | RegExp | LearningStateHandler<SyntaxStore>,
        have?: Array<string>,
        maybe?: Array<string>,
        after?: Array<string>
        next?: string,
        end?: string
        like?: string
        is?: string
    }
}

export interface SyntaxField {
    key: string,
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
    tree: Array<SyntaxBranch>,
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
                if(item.type === 'DEFINED') {
                    return item.value === defined.is
                }
                return false
            })
        } else if (defined.maybe) {
            let maybe = defined.maybe

            bot.learn(tokenName, ({machine, item}: LearningStateHandlerArgs<SyntaxStore>) => {
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
                if (item.type === "DEFINED" && lastAfter !== item.value) {
                    return false
                }

                for (let i = 0; i < after.length; i++) {
                    const historyItem = itemHistory[itemHistory.length - i - 1]
                    const afterItem = after[i]

                    if (item.type === "DEFINED" && historyItem.value !== afterItem) {
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

            const {have, end} = defined
            if (!have) {
                throw new Error(`[${tokenName}]Expected field "have" after field "after"`)
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


                let token = have[branch.tree.length % have.length]
                console.log(`On [${tokenName}] have:`, have, 'token:', token, 'branch tree:', branch.tree)
                let result = machine.isKnow(token, item)

                if (result) {
                    branch.tree.push({
                        type: result,
                        item,
                        end: true
                    })
                }

                if (end) {
                    if (item.type === 'DEFINED' && item.value === end) {
                        branch.end = true
                        machine.pop()
                    }
                    return
                }

                if (branch.tree.length >= have.length && branch.tree.every(x => !!x.end)) {
                    branch.end = true
                    machine.pop()
                }
            })

            continue
        }

        if (defined.have) {

            bot.learn(tokenName, defined.key as string, ({store, machine, item}: LearningStateHandlerArgs<SyntaxStore>) => {
                store.branch = {
                    type: tokenName,
                    tree: []
                }
            })

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
                    store.tree.push(store.branch)
                    store.branch = {tree: []}
                    machine.pop()
                }

            })
            continue
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
    if (machine.isKnow(tokens.VARIABLE, item)) {
        machine.nextState(tokens.VARIABLE)
    } else if (machine.isKnow(tokens.EMPTY_LINE, item)) {
        store.tree.push({
            token: tokens.EMPTY_LINE,
            item
        })
    }
}

