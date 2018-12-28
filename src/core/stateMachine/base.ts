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
        console.log('Learning pop state', this.store)
        return this.stateHistory.pop()
    }
}