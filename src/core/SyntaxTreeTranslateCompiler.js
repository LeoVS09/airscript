const constants = require('../tokens')
const {LearningStateMachine} = require('./StateMachine')

function createStore () {
  return {
    tree: [],
    branch: {
      token: '',
      data: []
    }
  }
}

function teach (bot, syntaxDefinitions) {
  for (let tokenName in syntaxDefinitions) {
    let defined = syntaxDefinitions[tokenName]

    if (defined.key)
      bot.learn(tokenName, defined.key)
    else if (defined.maybe) {
      let maybe = defined.maybe
      bot.learn(tokenName, ({machine, item}) => {
        for (let token of maybe)
          if (machine.isKnow(token, item))
            return token
      })
    }

    if (defined.have) {
      bot.learn(tokenName, defined.key, ({store, machine, item}) => {
        store.branch = {
          type: tokenName,
          data: []
        }
      })

      bot.on(tokenName, ({store, machine, item}) => {
        let token = defined.have[store.branch.data.length]
        let result = machine.isKnow(token, item)
        if (result) {
          store.branch.data.push({
            type: result,
            item
          })
        }
        if (store.branch.data.length >= defined.have.length) {
          store.tree.push(store.branch)
          store.branch = {}
          machine.pop()
        }
      })
    }
  }
}

function start ({store, machine, item}) {
  if (machine.isKnow(constants.VARIABLE, item)) {
    machine.nextState(constants.VARIABLE)
  }
}

module.exports = function (syntaxDefinitions) {
  let store = createStore()

  let bot = new LearningStateMachine(start, store)

  teach(bot, syntaxDefinitions)

  console.log('Learned states:\n', bot.states)

  return bot
}