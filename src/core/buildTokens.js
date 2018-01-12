const resolve = require('./resolve')
const constants = require('./tokens')

// TODO: tokens must be functions
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


module.exports = function (strings) {
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