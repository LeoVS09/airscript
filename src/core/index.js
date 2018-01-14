const parse = require('./parse')
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

  return new Promise((resolve, reject) => {

    let preprocessed = text.split('\n')
      .map(parse)
      .map(value => {
        console.debug('parsed: ', value)
        return value
      })

    let tokens = buildTokens(preprocessed)
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