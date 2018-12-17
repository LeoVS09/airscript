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
                result += `let ${branch.tree[0].item}\n`
            } else if(branch.tree[1].type === tokens.OBJECT) {
                result += `let ${branch.tree[0].item} = {\n`

                if(!branch.tree[1].tree) {
                    throw new Error("OBJECT not have data tree")
                }

                branch.tree[1].tree.forEach(branch => {
                    if(branch.type === tokens.VARIABLE_NAME) {
                        result += `\t${branch.item}: `
                    } else {
                        result += `${branch.item} // ${branch.type}\n`
                    }
                })

                result += '}\n'
            } else {
                result += `let ${branch.tree[0].item} = ${branch.tree[1].item} // ${branch.tree[1].type}\n`
            }
        } else if (branch.type === 'OBJECT') {
            result += 'let ' + branch.value + ' = {\n'
            const {fields} = branch

            if(!fields) {
                throw new Error('Unexpected behavior: syntax branch object not hav fields')
            }

            fields.forEach((field, i) => {
                result += '\t' + field.key + ': ' + field.value + (i != fields.length - 1 ? ',' : '') + '\n'
            })

            result += '}\n'
        }

    }

    return result
}