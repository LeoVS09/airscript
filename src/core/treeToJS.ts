import {SyntaxBranch} from './syntaxTree/translate'
import {constants as tokens} from './tokens'
export default function (tree: Array<SyntaxBranch>) {
    let result = ''

    for (let branch of tree) {
        if (branch.token === tokens.EMPTY_LINE) {
            result += "\n"
        } else if (branch.type === tokens.VARIABLE) {
            if(!branch.tree) {
                throw new Error("VARIABLE not have data tree")
            }

            if(branch.tree[1].type === tokens.END_LINE) {
                // TODO: more typesation
                // @ts-ignore
                result += `let ${branch.tree[0].item.value}\n`
            } else if(branch.tree[1].type === tokens.OBJECT) {
                // @ts-ignore
                result += `let ${branch.tree[0].item.value} = {\n`

                if(!branch.tree[1].tree) {
                    throw new Error("OBJECT not have data tree")
                }

                branch.tree[1].tree.forEach(branch => {
                    if(branch.type === tokens.VARIABLE_NAME) {
                        // @ts-ignore
                        result += `\t${branch.item.value}: `
                    } else {
                        // @ts-ignore
                        result += `${branch.item.value} // ${branch.type}\n`
                    }
                })

                result += '}\n'
            } else {
                // @ts-ignore
                result += `let ${branch.tree[0].item.value} = ${branch.tree[1].item.value} // ${branch.tree[1].type}\n`
            }
        } else if (branch.type === tokens.ACTION) {
            const {item, tree} = branch
            if(!item || !tree || !tree.length) {
                throw new Error("Action not have item or tree")
            }

            result += `${item.value}`

            result += addItems(branch)

            result += '\n'
        }

    }

    return result
}

function addItems(branch: SyntaxBranch): string {
    let result = ""

    const {tree} = branch

    if(!tree){
        throw new Error("Not have tree when expected")
    }

    let haveTree = false

    for(let i = 0; i < tree.length; i++) {
        const data = tree[i]

        if(data.tree){
            result += addItems(data)
            haveTree = true
        } else {
            if(!data.item){
                throw new Error('Not have item when expected')
            }
            result += " " + data.item.value
        }
    }

    if(!haveTree) {
        try {
            result = " " + eval(result)
        } catch (e) {
            
        }
    }

    return result

}