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
  }

  on (name, handler) {
    this.states[name] = handler
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

}

module.exports = {StateMachine, LearningStateMachine}