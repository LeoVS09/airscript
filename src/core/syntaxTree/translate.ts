import {constants as tokens} from '../tokens'
import {LearningStateMachine, LearningStateHandlerArgs} from '../StateMachine'

export interface SyntaxDefinitions {
  [token: string]: {
    key?: string | RegExp,
    have?: Array<string>,
    maybe?: Array<string>
  }
}

export interface SyntaxField {
  key: string,
  value: string
}

export interface SyntaxBranch {
  token?: string
  type?: string
  data: Array<any>
  value?: string
  fields?: Array<SyntaxField>
}

export interface SyntaxStore {
  tree: Array<SyntaxBranch>,
  branch: SyntaxBranch
}

export default function (syntaxDefinitions: SyntaxDefinitions): LearningStateMachine<SyntaxStore, string | RegExp> {
  let store = createStore()

  let bot = new LearningStateMachine<SyntaxStore, string | RegExp>(start, store)

  teach(bot, syntaxDefinitions)

  console.log('Learned states:\n', bot.states)

  return bot
}

function createStore (): SyntaxStore {
  return {
    tree: [],
    branch: {
      token: '',
      data: []
    }
  }
}

function teach (bot: LearningStateMachine<SyntaxStore, string | RegExp>, syntaxDefinitions: SyntaxDefinitions) {
  for (let tokenName in syntaxDefinitions) {
    let defined = syntaxDefinitions[tokenName]

    if (defined.key)
      {
        // @ts-ignore
        bot.learn(tokenName, defined.key)
      }
    else if (defined.maybe) {
      let maybe = defined.maybe

      bot.learn(tokenName, ({machine, item}: LearningStateHandlerArgs<SyntaxStore, string | RegExp>) => {
        for (let token of maybe) {
          if (machine.isKnow(token, item)) {
            return token
          }
        }
        return false
      })
    }

    if (defined.have) {
      bot.learn(tokenName, defined.key as string, ({store, machine, item}: LearningStateHandlerArgs<SyntaxStore, string | RegExp>) => {
        store.branch = {
          type: tokenName,
          data: []
        }
      })

      bot.on(tokenName, ({store, machine, item}) => {
        if(!defined.have) {
          throw new Error("Unexpected behavior: learning state -> defined not have 'have'")
        }

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
          store.branch = { data: [] }
          machine.pop()
        }
      })
    }
  }
}

function start ({store, machine, item}: LearningStateHandlerArgs<SyntaxStore, string | RegExp>) {
  if (machine.isKnow(tokens.VARIABLE, item)) {
    machine.nextState(tokens.VARIABLE)
  }
}

