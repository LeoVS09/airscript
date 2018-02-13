class StateMachine {

  constructor (initialState, store, preHandler = (() => true)) {
    this.stateHistory = [initialState]
    this.pre = preHandler
    this.store = store
  }

  genHandlerArgs (item) {
    return {
      item,
      machine: this,
      store: this.store
    }
  }

  work (arr) {
    arr.forEach(item => {
      let args = this.genHandlerArgs(item)
      let canWork = this.pre(args)
      if (!canWork) {
        return
      }
      this.handle(args)
    })
  }

  handle (arg) {
    let head = this.stateHistory[this.stateHistory.length - 1]
    head(arg)
  }

  push (handler) {
    this.stateHistory.push(handler)
  }

  pop () {
    this.stateHistory.pop()
  }
}

class LearningStateMachine extends StateMachine {

  constructor (initialState, store, preHandler) {
    super(initialState, store, preHandler)
    this.states = {}
    this.patterns = {}
  }

  on (name, handler) {
    this.states[name] = handler
  }

  learn(token, pattern, callback){
    this.patterns[token] = item => {
      if(typeof pattern === 'function')
        return pattern(this.genHandlerArgs(item))

      if(this.test(pattern, item)) {
        if(callback)
          callback(this.genHandlerArgs(item))
        return token
      }

      return false
    }
  }

  isKnow(token, item){
    let pattern = this.patterns[token]
    if(!pattern){
      throw new Error("Don't know this token: " + token)
    }

    return pattern(item)
  }

  genHandlerArgs(args){
    return {
      ...super.genHandlerArgs(args),
      states: this.states
    }
  }

  nextState (name) {
    let handler = this.states[name]
    if(!handler){
      throw new Error('This action not defined: ' + name)
    }

    console.log("Dispatch: ", name, this.store)
    this.push(handler)
  }

  test (key, item) {
    if (typeof key === 'string') {
      return key === item
    } else if (typeof key === 'object' && key.test) {
      return key.test(item)
    }
    return false
  }

}

module.exports = {StateMachine, LearningStateMachine}