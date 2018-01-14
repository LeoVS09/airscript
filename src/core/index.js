const parse = require('./parse')
const buildSyntaxTree = require('./buildSyntaxTree')
const treeToJS = require('./treeToJS')
const TokensBuilder = require('./buildTokens')
const syntaxTreeTranslateCompiler = require('./SyntaxTreeTranslateCompiler')

let DEBUG = true

console.debug = (...args) => {
  if (DEBUG)
    console.log('[DEBUG] ', ...args)
}

// Map array and decompose result arrays into one
Array.prototype.mapMany = function (callback, thisArg) {
  let res = []
  this.map(callback, thisArg)
    .forEach(array => {
      res.push(...array)
    })
  return res
}

// Call callback function and return original array
Array.prototype.process = function (callback) {
  this.forEach(callback)
  return this
}

module.exports = function (text, syntaxDefinitions, debug = false) {
  DEBUG = debug

  let syntaxTreeTranslater = syntaxTreeTranslateCompiler(syntaxDefinitions)

  return new Promise((resolve, reject) => {
    let tokensBuilder = new TokensBuilder()

    let parsed = text.split('\n')
      .map(parse)
      .process(value => console.debug('Parsed: ', value))
      .mapMany(tokensBuilder.build)
      .process(value => console.debug('Build tokens: ', value))
    syntaxTreeTranslater.work(parsed)
    let tree = syntaxTreeTranslater.store.tree

    console.debug('Tree: ', tree)

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