import {constants as tokens} from './tokens'

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
        return this.stateHistory.pop()
    }
}

export interface LearningStates<Store, Item> {
    [key: string]: LearningStateHandler<Store, Item>
}

export interface LearningPatterns<Store, Item> {
    [key: string]: StateHandler<Store, Item>
}

export interface LearningStateHandlerArgs<Store, Item> {
    item: Item,
    itemHistory: Array<Item>
    machine: LearningStateMachine<Store, Item>,
    store: Store
    states: LearningStates<Store, Item>
}

export interface LearningStateHandler<Store, Item> {
    (args: LearningStateHandlerArgs<Store, Item>): void
}

export class LearningStateMachine<Store, Item> extends StateMachine<Store, Item> {

    states: LearningStates<Store, Item> = {}
    patterns: LearningPatterns<Store, Item> = {}

    constructor(initialState: LearningStateHandler<Store, Item>, store: Store, beforeHandler?: BeforeHandler<Store, Item>) {
        super(initialState as StateHandler<Store, Item>, store, beforeHandler)
    }

    on(name: string, handler: LearningStateHandler<Store, Item>) {
        this.states[name] = handler
    }

    learn(token: string, pattern: string | LearningStateHandler<Store, Item>, callback?: LearningStateHandler<Store, Item>): void {
        this.patterns[token] = item => {
            if (typeof pattern === 'function')
                return pattern(this.genHandlerArgs(item))

            if (this.test(pattern, item)) {
                if (callback)
                    callback(this.genHandlerArgs(item))
                return token
            }

            return false
        }
    }

    isKnow(token: string, item: any): any {

        if(token === tokens.VARIABLE_NAME && (item === tokens.END_LINE || item === tokens.DECREASE_NESTING)) {
            // TODO: fix
            return false
        }

        let pattern = this.patterns[token]
        if (!pattern) {
            throw new Error("Don't know this token: " + token)
        }

        return pattern(item)
    }

    genHandlerArgs(args: any): LearningStateHandlerArgs<Store, Item> {
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
        this.push(handler as StateHandler<Store, Item>)
    }

    test(key: string | { test: (a: any) => boolean }, item: any): boolean {
        if (typeof key === 'string') {
            return key === item
        } else if (typeof key === 'object' && key.test) {
            return key.test(item)
        }
        return false
    }

}