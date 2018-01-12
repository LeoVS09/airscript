const buildSyntaxTree = require('./buildSyntaxTree')
const treeToJS = require('./treeToJS')
const buildTokens = require('./buildTokens')

let DEBUG = true

console.debug = (...args) => {
  if (DEBUG)
    console.log('[DEBUG] ', ...args)
}

module.exports = function (text, debug = false) {
  DEBUG = debug
  let strings = text.split('\n')
  return new Promise((resolve, reject) => {
    let tokens = buildTokens(strings)
    console.debug('buildTokens: ', tokens)

    let tree = buildSyntaxTree(tokens)
    console.debug('buildSyntaxTree', tree)

    resolve({
      toJS () {
        return new Promise((resolve, reject) => {
          let text = treeToJS(tree)
          resolve(text)
        })
      }
    })
  })
}