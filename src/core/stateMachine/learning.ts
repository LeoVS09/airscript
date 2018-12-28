import {DefinedToken, WordToken} from "../tokens/build";
import {SyntaxBranch, SyntaxStore} from "../syntaxTree/learning/types";
import {getLastStoreItem, getLastTreeItem} from "../syntaxTree/learning/store";
import {BeforeHandler, StateHandler, StateMachine} from "./base";


export type LearningItem = DefinedToken | WordToken<string>

export interface LearningStates<Store extends SyntaxStore> {
    [key: string]: LearningStateHandler<Store>
}

export interface LearningPatternHandler<Store> {
    (item: DefinedToken | WordToken<string>): string | false | any
}

export interface LearningPatterns<Store> {
    [key: string]: LearningPatternHandler<Store>
}

export interface LearningStateHandlerArgs<Store extends SyntaxStore> {
    item: LearningItem,
    itemHistory: Array<LearningItem>
    machine: LearningStateMachine<Store>,
    store: Store,
    branch: SyntaxBranch
    states: LearningStates<Store>
}

export interface LearningStateHandler<Store extends SyntaxStore> {
    (args: LearningStateHandlerArgs<Store>): any
}

export class LearningStateMachine<Store extends SyntaxStore> extends StateMachine<Store, LearningItem>{

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

        if(!this.store.branch) {
            this.store.branch = {
                end: false
            }
        }

        // TODO: refactor typings
        if(!this.store.tree) {
            this.store.tree = []
        }

        // TODO: Pushing must be after learn and handler action
        if(this.store.branch.end) {
            this.store.tree.push(this.store.branch)
            this.store.branch = {
                end: false
            }
        }

        const branch = getLastStoreItem(this.store)

        //console.log('[genHandlerArgs] item', args, '\nstore', this.store, '\nbranch', branch)

        return {
            ...super.genHandlerArgs(args),
            machine: this,
            states: this.states,
            branch
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