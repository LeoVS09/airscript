module.exports = function (tree) {
  let result = ''

  for (let branch of tree) {
    if(branch.token === "EMPTY"){
      result += "\n"
    } else if (branch.type === 'VARIABLE') {
      if (branch.type === 'OBJECT') {
        result += 'let ' + branch.value + ' = {\n'

        branch.fields.forEach((field, i) => {
          result += '\t' + field.key + ': ' + field.value + (i != branch.fields.length - 1 ? ',' : '') + '\n'
        })

        result += '}\n'
      } else {
        result += `let ${branch.data[0].item} = ${branch.data[1].item} // ${branch.data[1].type}\n`
      }
    }
  }

  return result
}