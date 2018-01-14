const resolve = require('./parse')
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
    if (/^(\-|\+)?([0-9]+)$/.test(value)) {
      return 'INTEGER'
    }
    if (/^(\-|\+)?([0-9]+(\.[0-9]+)?)$/.test(value)) {
      return 'FLOAT'
    }
    if (/^(\-|\+)?(|Infinity)$/.test(value)) {
      return 'Infinity'
    }
  },

  function isString (value) {
    if (value[0] === '\'' || value[0] === '\"' || value[0] === '`\`') {
      return 'STRING'
    }
  },

  function isBoolean (value) {
    if (value === 'true' || value === 'false') {
      return 'BOOLEAN'
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

module.exports = function (parsed) {
  let tokens = []
  let lastTabs = 0

  parsed.forEach(({tabs, words, isEmpty}) => {
    if (isEmpty && tokens.length > 0 && tokens[tokens.length - 1] !== constants.EMPTY_LINE) {
      tokens.push(constants.EMPTY_LINE)
      return
    }
    if (tabs > lastTabs)
      tokens.push(constants.INCREASE_NESTING)
    else if (tabs < lastTabs)
      tokens.push(constants.DECREASE_NESTING)
    lastTabs = tabs

    let understood = words.map(understand)
    tokens.push(...understood)

    tokens.push(constants.END_LINE)
  })

  return tokens
}
