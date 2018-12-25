import {constants as tokens} from './tokens'
import {DefinedToken, WordToken} from "./tokens/build";

export interface StateHandlerArgs<Store, Item> {
    item: Item,
    itemHistory: Array<Item>
    machine: StateMachine<Store, Item>
    store: Store
}

export interface StateHandler<Store, Item> {
    (args: StateHandlerArgs<Store, Item>): void
}

export interface BeforeHandler<Store, Item> {
    (args: StateHandlerArgs<Store, Item>): boolean
}

export class StateMachine<Store, Item> {

    stateHistory: Array<StateHandler<Store, Item>>
    store: Store
    before: (args: StateHandlerArgs<Store, Item>) => boolean
    itemHistory: Array<Item> = []

    constructor(initialState: StateHandler<Store, Item>, store: Store, beforeHandler: BeforeHandler<Store, Item> = (() => true)) {
        this.stateHistory = [initialState]
        this.before = beforeHandler
        this.store = store
    }

    genHandlerArgs(item: any): StateHandlerArgs<Store, Item> {
        return {
            item,
            itemHistory: this.itemHistory,
            machine: this,
            store: this.store
        }
    }

    work(arr: Array<any>): void {
        arr.forEach(item => {
            let args = this.genHandlerArgs(item)

            let canWork = this.before(args)
            if (!canWork) {
                return
            }

            this.handle(args)
            this.itemHistory.push(item)
        })
    }

    handle(arg: StateHandlerArgs<Store, Item>) {
        let head = this.stateHistory[this.stateHistory.length - 1]
        head(arg)
    }

    push(handler: StateHandler<Store, Item>) {
        this.stateHistory.push(handler)
    }

    pop(): StateHandler<Store, Item> | undefined {
        console.log('Learning pop')
        return this.stateHistory.pop()
    }
}

export type LearningItem = DefinedToken | WordToken<string>

export interface LearningStates<Store> {
    [key: string]: LearningStateHandler<Store>
}

export interface LearningPatternHandler<Store> {
    (item: DefinedToken | WordToken<string>): string | false | any
}

export interface LearningPatterns<Store> {
    [key: string]: LearningPatternHandler<Store>
}

export interface LearningStateHandlerArgs<Store> {
    item: LearningItem,
    itemHistory: Array<LearningItem>
    machine: LearningStateMachine<Store>,
    store: Store
    states: LearningStates<Store>
}

export interface LearningStateHandler<Store> {
    (args: LearningStateHandlerArgs<Store>): any
}

export class LearningStateMachine<Store> extends StateMachine<Store, LearningItem>{

    states: LearningStates<Store> = {}
    patterns: LearningPatterns<Store> = {}

    constructor(initialState: LearningStateHandler<Store>, store: Store, beforeHandler?: BeforeHandler<Store, LearningItem>) {
        super(initialState as StateHandler<Store, LearningItem>, store, beforeHandler)
    }

    on(name: string, handler: LearningStateHandler<Store>) {
        this.states[name] = handler
    }

    learn(token: string, pattern: string | RegExp | LearningStateHandler<Store>, callback?: LearningStateHandler<Store>): void {

        this.patterns[token] = (item: DefinedToken | WordToken<string>) => {
            if (typeof pattern === 'function')
                return pattern(this.genHandlerArgs(item))

            if(item.type === "DEFINED") {
                return false
            }

            if (this.test(pattern, item)) {
                if (callback)
                    callback(this.genHandlerArgs(item))
                return token
            }

            return false
        }
    }

    isKnow(token: string, item: any): any {

        let pattern = this.patterns[token]
        if (!pattern) {
            throw new Error("Don't know this token: " + token)
        }

        return pattern(item)
    }

    genHandlerArgs(args: any): LearningStateHandlerArgs<Store> {
        return {
            ...super.genHandlerArgs(args),
            machine: this,
            states: this.states
        }
    }

    nextState(name: string) {
        let handler = this.states[name]
        if (!handler) {
            throw new Error('This action not defined: ' + name)
        }

        console.log("Dispatch: ", name, this.store)
        this.push(handler as StateHandler<Store, LearningItem>)
    }

    test(key: string | RegExp, item: DefinedToken | WordToken<string>): boolean {
        if (typeof key === 'string') {
            return key === item.value
        } else if (typeof key === 'object' && key.test) {
            return key.test(item.value)
        }
        return false
    }

}