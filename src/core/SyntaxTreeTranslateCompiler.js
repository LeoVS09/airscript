const constants = require('../tokens')
const {LearningStateMachine} = require('./StateMachine')

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

function main ({item, machine, store, tokens}) {
  for (let tokenName in tokens) {
    let token = tokens[tokenName]
    if (test(token.key, item)) {
      token.handler({item, machine, store})
      return
    }
  }
}

function createStore () {
  return {
    tree: [],
    branch: {
      token: '',
      data: []
    }
  }
}

function build (syntaxDefinitions, tokenName = constants.VARIABLE) {
  let defined = syntaxDefinitions[tokenName]
  let token = {tokenName}

  if (defined.key) {
    token.key = defined.key
  }

  if (defined.next) {
    token.next = build(syntaxDefinitions, defined.next)
  } else if (defined.maybe) {
    token.maybe = []
    for (let maybeName of defined.maybe) {
      token.push(build(syntaxDefinitions, maybeName))
    }
  }

  return token
}

function teach (bot, syntaxDefinitions) {
  for (let tokenName in syntaxDefinitions) {
    let defined = syntaxDefinitions[tokenName]

    let setter = (store, item) => {}
    if (typeof defined.key === 'string')
      setter = (store, item) => store.branch = {
        type: tokenName,
        data: []
      }
    else
      setter = (store, item) => store.branch.data.push({
        type: tokenName,
        item
      })

    if (defined.next) {
      let nextToken = defined.next
      bot.on(tokenName, ({store, machine, item}) => {
        if(test(defined.key, item)) {
          setter(store, item)
          machine.nextState(nextToken)
          return true
        }
      })
    } else if (defined.maybe) {
      bot.on(tokenName, ({store, machine, item, states}) => {
        for (let maybe of defined.maybe) {
          let state = states[maybe]
          if (state({store, machine, item, states})) {
            machine.nextState(constants.END_LINE)
            return true
          }
        }
      })
    } else {
      bot.on(tokenName, ({store, machine, item}) => {
        if(test(defined.key, item)){
          setter(store, item)
          return true
        }
      })
    }
  }
}

module.exports = function (syntaxDefinitions) {
  let store = createStore()

  function start (args) {
    args.states[constants.VARIABLE](args)
  }

  let bot = new LearningStateMachine(start, store)

  bot.on(constants.END_LINE, ({store, machine, item}) => {
    if(test(constants.END_LINE, item)) {
      store.tree.push(store.branch)
      store.branch = {}
      machine.nextState(constants.VARIABLE)
    }
  })

  teach(bot, syntaxDefinitions)

  console.log('Learned actions:\n', bot.actions)

  return bot
}