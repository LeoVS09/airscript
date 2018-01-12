const StateMachine = require('./StateMachine')
const resolve = require('./resolve')
const constants = require('./tokens')
const buildSyntaxTree = require('./buildSyntaxTree')

let DEBUG = true

console.debug = (...args) => {
  if (DEBUG)
    console.log('[DEBUG] ', ...args)
}

const reserved = {
  'var': (string) => {
    let [, name] = string.split(' ')
    let res = `var ${name} = `
    let calcVal = function (string) {

    }
  }
}

const checks = [
  function isReserved (value) {
    if (value === 'var')
      return 'VARIABLE'
  },

  function isNumber (value) {
    if (Number.isInteger(+value)) {
      return 'NUMBER'
    }
  },

  function isString (value) {
    if (value[0] === '\'' || value[0] === '\"' || value[0] === '`\`') {
      return 'STRING'
    }
  },

  function isWord () {
    return 'WORD'
  }
]

function understand (value) {
  let result = null

  checks.some(check => {
    let key = check(value)
    if (key) {
      result = {key, value}
      return true
    }
    return false
  })

  return result
}


function buildTokens (strings) {
  let tokens = []
  let lastTabs = 0

  strings
    .map(resolve)
    .map(value => {
      console.debug('resolve: ', value)
      return value
    })
    .filter(result => !result.isEmpty)
    .forEach(({tabs, words}) => {
      if (tabs > lastTabs)
        tokens.push(constants.INCREASE_NESTING)
      else if (tabs < lastTabs)
        tokens.push(constants.DECREASE_NESTING)

      lastTabs = tabs

      words.forEach(word => {
        let result = understand(word)
        if (result)
          tokens.push(result)
        else {
          console.error('Unexpected situation, don\'t know this word: ' + word)
        }
      })

      tokens.push(constants.END_LINE)
    })

  return tokens
}

function rollUpTree (tree) {
  let result = ''

  for (let branch of tree) {
    if (branch.key === 'VARIABLE') {
      if (branch.type === 'OBJECT') {
        result += 'let ' + branch.value + ' = {\n'

        branch.fields.forEach((field, i) => {
          result += '\t' + field.key + ': ' + field.value + (i != branch.fields.length - 1 ? ',' : '') + '\n'
        })

        result += '}'
      }
    }
  }

  return result
}

function parse (strings) {
  let tokens = buildTokens(strings)
  console.debug('buildTokens: ', tokens)

  let tree = buildSyntaxTree(tokens)
  console.debug('buildSyntaxTree', tree)

  return rollUpTree(tree)
}

function toJS (data) {
  return data
}

module.exports = function (text, debug = false) {
  DEBUG = debug
  let strings = text.split('\n')
  let data = parse(strings)
  return new Promise((resolve, reject) => {
    resolve({
      toJS () {
        return new Promise((resolve, reject) => {
          resolve(data)
        })
      }
    })
  })
}