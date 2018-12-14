import {constants} from '../tokens'
import {StateMachine, StateHandlerArgs} from '../StateMachine'

export interface SyntaxToken {
    key?: string,
    value?: string
}

export interface SyntaxCurrent {
    key?: string
    value?: string,
    type?: string
}

export interface SyntaxBranch extends SyntaxToken {
    fields?: Array<SyntaxCurrent>,
    type?: string
}

type SyntaxTree = Array<SyntaxBranch>

export interface SyntaxStore {
    tree: SyntaxTree,
    branch: SyntaxBranch,
    current: SyntaxCurrent
}

export default function (tokens: Array<string>): SyntaxTree {
    let store = {
        tree: [],
        branch: {},
        current: {}
    } as SyntaxStore

    const builder = new StateMachine(main, store)
    builder.work(tokens)

    if (store.branch.key) {
        store.tree.push(store.branch)
    }

    return store.tree
}

function main({item: token, machine, store}: StateHandlerArgs<SyntaxStore, SyntaxToken>) {
    if (token.key === 'VARIABLE') {
        store.branch = {key: 'VARIABLE'}
        machine.push(variable)
    }
}

function variable({item: token, machine, store}: StateHandlerArgs<SyntaxStore, SyntaxToken>) {
    if (token.key === 'WORD') {
        store.branch.value = token.value
        machine.push(value)
    }
}

function value({item: token, machine, store}: StateHandlerArgs<SyntaxStore, SyntaxToken>) {
    if (token === constants.END_LINE) {
        store.branch.fields = []
        store.branch.type = 'OBJECT'
        machine.push(valueObject)
    }
}

function valueObject({item: token, machine}: StateHandlerArgs<SyntaxStore, SyntaxToken>) {
    if (token === constants.INCREASE_NESTING) {
        machine.push(valueObjectName)
    }
}

function valueObjectName({item: token, machine, store}: StateHandlerArgs<SyntaxStore, SyntaxToken>) {
    if (token.key === 'WORD') {
        store.current = {key: token.value}
        machine.push(valueObjectValue)
    }
    if (token === constants.DECREASE_NESTING) {
        store.tree.push(store.branch)
        store.branch = {}
        machine.push(main)
    }
}

function valueObjectValue({item: token, machine, store}: StateHandlerArgs<SyntaxStore, SyntaxToken>) {
    store.current.value = token.value
    store.current.type = token.key

    if (!store.branch.fields) {
        store.branch.fields = []
    }
    store.branch.fields.push(store.current)

    store.current = {}

    machine.push(waitNextField)
}

function waitNextField({item: token, machine}: StateHandlerArgs<SyntaxStore, SyntaxToken>) {
    if (token === constants.END_LINE) {
        machine.push(valueObjectName)
    }
}

function empty({item: token, store}: StateHandlerArgs<SyntaxStore, SyntaxToken>) {
    if (token === constants.EMPTY_LINE) {
        store.tree.push({key: 'EMPTY'})
        return false
    }
    return true
}


