import constants from './constants'
import {Store} from "../parseLine";

export interface WordToken<T> {
    type: 'WORD'
    value: T
}

export interface DefinedToken {
    type: 'DEFINED',
    value: string
}

function understandWord<T>(value: T): WordToken<T> {
    return {
        type: 'WORD',
        value
    }
}

function understandDefined(value: string): DefinedToken {
    return {
        type: "DEFINED",
        value: value
    }
}

export default class {
    lastTabs: number = 0

    build = ({tabs, words, isEmpty}: Store): Array<DefinedToken | WordToken<string>> => {
        let defined = new Array<string>()

        if (tabs > this.lastTabs)
            defined.push(constants.INCREASE_NESTING)
        else if (tabs < this.lastTabs)
            defined.push(constants.DECREASE_NESTING)
        this.lastTabs = tabs

        if (!defined.length && isEmpty) {
            return [understandDefined(constants.EMPTY_LINE)]
        }

        let tokens: Array<DefinedToken | WordToken<string>> = defined.map(understandDefined)

        tokens.push(...words.map(understandWord))

        tokens.push(understandDefined(constants.END_LINE))

        return tokens
    }

}

