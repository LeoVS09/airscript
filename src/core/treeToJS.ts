import {SyntaxBranch} from './syntaxTree/translate'

export default function (tree: Array<SyntaxBranch>) {
    let result = ''

    for (let branch of tree) {
        if (branch.token === "EMPTY") {
            result += "\n"
        } else if (branch.type === 'VARIABLE') {

            result += `let ${branch.data[0].item} = ${branch.data[1].item} // ${branch.data[1].type}\n`
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