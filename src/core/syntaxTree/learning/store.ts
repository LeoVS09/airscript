import {SyntaxBranch, SyntaxStore} from "./types";

export function createStore(): SyntaxStore {
    return {
        tree: [],
        branch: {
            token: '',
            tree: []
        }
    }
}

export function pushToStore(store: SyntaxStore | SyntaxBranch, branch: SyntaxBranch) {
    if(!store.branch) {
        store.branch = branch
        return
    }

    if(!store.tree) {
        throw new Error("Not have tree in branch")
    }

    for(let leaf of store.tree) {
        if(!leaf.end) {
            pushToStore(leaf, branch)
            return
        }
    }

    store.tree.push(branch)
}

export function getLastTreeItem(store: SyntaxBranch): SyntaxBranch {
    if(!store.tree) {
        return store
    }

    const last = store.tree[store.tree.length - 1]
    if(!last || last.end){
        return store
    }



    if(!last.tree || !last.tree.length) {
        return last
    }

    return getLastTreeItem(last)

}

export function getLastStoreItem(store: SyntaxStore): SyntaxBranch {

    if(!store.branch) {
        store.branch = {
            end: false
        }
    }

    return getLastTreeItem(store.branch)
}