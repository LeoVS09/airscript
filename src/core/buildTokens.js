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
    if (/^(\-|\+)?([0-9]+)$/.test(value)) {
      return 'INTEGER'
    }
    if (/^(\-|\+)?([0-9]+(\.[0-9]+)?)$/.test(value)){
      return 'FLOAT'
    }
    if (/^(\-|\+)?(|Infinity)$/.test(value)){
      return 'Infinity'
    }
  },

  function isString (value) {
    if (value[0] === '\'' || value[0] === '\"' || value[0] === '`\`') {
      return 'STRING'
    }
  },

  function isBoolean(value) {
    if(value === 'true' || value === 'false'){
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


module.exports = function (text) {
  let tokens = []
  let lastTabs = 0

  text.split('\n')
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

      let understood = words.map(understand)
      tokens.push(...understood)

      tokens.push(constants.END_LINE)
    })

  return tokens
}
