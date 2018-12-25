import {SyntaxStore} from "./types";

export function createStore(): SyntaxStore {
    return {
        tree: [],
        branch: {
            token: '',
            tree: []
        }
    }
}