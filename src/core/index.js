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

// parse string and find count tabs or spaces on start, all words, and empty bool
function resolve (string) {

  let words = []
  let current = ''
  let tabs = 0
  let strategy = 'START'
  let isEmpty = true
  let isString = false
  let stringSymbol = ''

  if (string.length === 0)
    return {tabs, words, isEmpty}

  string.split('').forEach(item => {
    if (item === '\r') {
      return
    }

    //console.debug('resolve strategy: ', strategy)

    if (strategy === 'START') {
      if (item === ' ' || item === '\t') {
        tabs++
      } else {
        current += item
        if (item === '\'' || item === '\"' || item === '`') {
          stringSymbol = item
          strategy = 'STRING'
        } else {
          strategy = 'WORD'
        }
      }
      return
    }

    if (strategy === 'DEFAULT') {
      if (item !== ' ') {
        current += item
        if (item === '\'' || item === '\"' || item === '`') {
          stringSymbol = item
          strategy = 'STRING'
        } else {
          strategy = 'WORD'
        }
      }
      return
    }

    if (strategy === 'STRING') {
      current += item
      if (item === stringSymbol) {
        words.push(current)
        current = ''
        strategy = 'DEFAULT'
      }
      return
    }

    if (strategy === 'WORD') {
      if (item === ' ') {
        words.push(current)
        current = ''
        strategy = 'DEFAULT'
      } else {
        current += item
      }
      //console.debug('resolve word: ', item, ' current: ', current)
      return
    }

  })

  if (strategy === 'WORD') {
    words.push(current)
    current = ''
  }

  if (strategy === 'START')
    isEmpty = true
  else
    isEmpty = false

  return {tabs, words, isEmpty}
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

const INCREASE_NESTING = {key: 'INCREASE_NESTING'}
const DECREASE_NESTING = {key: 'DECREASE_NESTING'}
const END_LINE = {key: 'END_LINE'}

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
        tokens.push(INCREASE_NESTING)
      else if (tabs < lastTabs)
        tokens.push(DECREASE_NESTING)

      lastTabs = tabs

      words.forEach(word => {
        let result = understand(word)
        if (result)
          tokens.push(result)
        else {
          console.error('Unexpected situation, don\'t know this word: ' + word)
        }
      })

      tokens.push(END_LINE)
    })

  return tokens
}

function defaultStrategy () {

}

function groupBy (arr, keySelector) {
  let dict = {}

  arr.forEach((el, i) => {
    let key = keySelector(el, i)
    if (dict[key])
      dict[key].push(el)
    else
      dict[key] = [el]
  })

  return dict
}

function buildSyntaxTree (tokens) {

  let lastTab = 0
  let tabsCount = 0
  let tree = []

  let strategy = 'DEFAULT'
  let branch = {}
  let current = {}

  tokens.forEach(token => {
    if (strategy === 'DEFAULT') {
      if (token.key === 'VARIABLE') {
        strategy = 'VARIABLE'
        branch = {key: 'VARIABLE'}
      }
      return
    }

    if (strategy === 'VARIABLE') {
      if (token.key === 'WORD') {
        strategy = 'VALUE'
        branch.value = token.value
      }
      return
    }

    if (strategy === 'VALUE') {
      if (token === END_LINE) {
        strategy = 'VALUE_OBJECT'
        branch.fields = []
        branch.type = 'OBJECT'
      }
      return
    }

    if (strategy === 'VALUE_OBJECT') {
      if (token === INCREASE_NESTING) {
        strategy = 'VALUE_OBJECT_NAME'
      }
      return
    }

    if (strategy === 'VALUE_OBJECT_NAME') {
      if (token.key === 'WORD') {
        current = {key: token.value}
        strategy = 'VALUE_OBJECT_VALUE'
      }
      if (token === DECREASE_NESTING) {
        tree.push(branch)
        branch = {}
        strategy = 'DEFAULT'
      }
      return
    }

    if (strategy === 'VALUE_OBJECT_VALUE') {
      current.value = token.value
      current.type = token.key
      branch.fields.push(current)
      current = {}
      strategy = 'WAIT_NEXT_FIELD'
      return
    }

    if (strategy === 'WAIT_NEXT_FIELD') {
      if (token === END_LINE) {
        strategy = 'VALUE_OBJECT_NAME'
      }
      return
    }
  })
  if (strategy === 'WAIT_NEXT_FIELD' || strategy === 'VALUE_OBJECT_NAME') {
    tree.push(branch)
  }

  return tree
}

const logic = {}

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

  let text = rollUpTree(tree)
  return text
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