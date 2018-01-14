module.exports = function (tree) {
  let result = ''

  for (let branch of tree) {
    if(branch.key === "EMPTY"){
      result += "\n"
    } else if (branch.key === 'VARIABLE') {
      if (branch.type === 'OBJECT') {
        result += 'let ' + branch.value + ' = {\n'

        branch.fields.forEach((field, i) => {
          result += '\t' + field.key + ': ' + field.value + (i != branch.fields.length - 1 ? ',' : '') + '\n'
        })

        result += '}\n'
      }
    }
  }

  return result
}