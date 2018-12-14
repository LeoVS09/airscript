import constants from './constants'
import {Store} from "../parseLine";

function understand<T>(value: T): T {
    return value
}

export default class {
    lastTabs: number = 0

    build = ({tabs, words, isEmpty}: Store) => {
        let tokens: Array<string> = []

        if (
            isEmpty &&
            tokens.length > 0 &&
            tokens[tokens.length - 1] !== constants.EMPTY_LINE
        ) {
            tokens.push(constants.EMPTY_LINE)
            return tokens
        }

        if (tabs > this.lastTabs)
            tokens.push(constants.INCREASE_NESTING)
        else if (tabs < this.lastTabs)
            tokens.push(constants.DECREASE_NESTING)
        this.lastTabs = tabs

        let understood = words.map(understand)
        tokens.push(...understood)

        tokens.push(constants.END_LINE)

        return tokens
    }

}

