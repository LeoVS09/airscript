const constants = require('../tokens')
const StateMachine = require('./StateMachine')

function test (key, item) {
  if (typeof key === 'string') {
    return key === item
  } else if (typeof key === 'object' && key.test) {
    return key.test(item)
  }
  return false
}

let createState = tokenName => ({item, machine, store, tokens}) => {
  let token = tokens[tokenName]
  if (token.key === item) {
    token.handler({item, machine, store})
  }
}

const mainTokenList = [
  constants.VARIABLE
]

function main ({item, machine, store, tokens}) {
  for (let tokenName in tokens) {
    let token = tokens[tokenName]
    if (test(token.key, item)) {
      token.handler({item, machine, store})
      return
    }
  }
}

class SyntaxTreeTranslater extends StateMachine {
  constructor (initialState, store, tokens) {
    super(initialState, store)
    this.tokens = tokens
  }

  genHandlerArgs (item) {
    return {
      ...super.genHandlerArgs(item),
      tokens: this.tokens
    }
  }

  push (tokenName) {
    if (typeof tokenName === 'string') {
      let token = this.tokens[tokenName]
      super.push(token.handler)
    } else {
      super.push(tokenName)
    }
  }
}

module.exports = function (syntaxDefinitions) {
  let tokens = {}

  for (let tokenName in syntaxDefinitions) {
    let defined = syntaxDefinitions[tokenName]
    let nextStateDefiner = machine => {}
    let end = store => {}
    if (defined.next) {
      nextStateDefiner = machine => {
        machine.push(defined.next)
      }
    } else if (defined.maybe) {
      nextStateDefiner = machine => {
        machine.push(({item, machine, store, tokens}) => {
          for (let tokenName in tokens) {
            let token = tokens[tokenName]

            if (test(token.key, item)) {
              token.handler({item, machine, store})
              return
            }
          }
        })
      }
    } else {
      nextStateDefiner = machine => {
        machine.push(main)
      }
      end = store => {
        store.tree.push(store.branch)
        store.branch = {}
      }
    }

    let setter = (store, value) => {}

    if (tokenName === constants.VARIABLE)
      setter = (store, value) => {
        store.branch.token = value
      }
    else if (tokenName === constants.VARIABLE_NAME)
      setter = (store, value) => {
        store.branch.name = value
      }
    else if (tokenName === constants.INTEGER) {
      setter = (store, value) => {
        store.branch.value = value
      }
    }

    let tokenDescription = {key: defined.key}
    if (defined.key) {
      if (typeof defined.key === 'string')
        tokenDescription.handler = ({machine, store}) => {
          setter(store, tokenName)
          nextStateDefiner(machine)
        }
      else if (typeof defined.key === 'object' && defined.key.test) {
        tokenDescription.handler = ({item, machine, store}) => {
          setter(store, item)
          end(store)
          nextStateDefiner(machine)
        }
      }
    } else {
      tokenDescription.handler = (({item, machine, store, tokens}) => {
        for (let tokenName in tokens) {
          let token = tokens[tokenName]

          if (test(token.key, item)) {
            token.handler({item, machine, store})
            return
          }
        }
      })
    }

    tokens[tokenName] = tokenDescription
  }

  let store = {
    tree: [],
    branch: {}
  }

  console.log('TOKENS: ', tokens)

  return new SyntaxTreeTranslater(main, store, tokens)
}