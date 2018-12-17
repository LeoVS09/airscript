import parseLine from './parseLine'
import * as syntaxTree from './syntaxTree'
import treeToJS from './treeToJS'
import {TokensBuilder} from './tokens'

let DEBUG = true

console.debug = (...args) => {
    if (DEBUG)
        console.log('[DEBUG] ', ...args)
}

export {
    syntaxTree
}

// Map array and decompose result arrays into one
function mapMany<T, R>(arr: Array<T>, callback: (t: T) => Array<R>, thisArg?: any): Array<R> {
    let res = [] as Array<R>
    arr.map(callback, thisArg)
        .forEach(array => {
            res.push(...array)
        })
    return res
}

export interface Interpreter {
    toJS: () => Promise<string>
}

export default function (text: string, syntaxDefinitions: syntaxTree.SyntaxDefinitions, debug = false): Promise<Interpreter> {
    DEBUG = debug

    let syntaxTreeTranslator = syntaxTree.compileTranslator(syntaxDefinitions)

    return new Promise((resolve, reject) => {
        let tokensBuilder = new TokensBuilder()

        let parsed = text.split('\n')
            .map(parseLine);
        parsed.forEach(value => console.debug('Parsed: ', value))

        let tokenized = mapMany(parsed, tokensBuilder.build)
        tokenized.forEach(value => console.debug('Build tokens: ', value))

        syntaxTreeTranslator.work(tokenized)
        let tree = syntaxTreeTranslator.store.tree

        console.debug('Tree: ', tree)

        resolve({
            toJS: () => new Promise((resolve, reject) => {
                let text = treeToJS(tree)
                resolve(text)
            })
        })
    })
}