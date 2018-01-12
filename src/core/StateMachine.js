module.exports = class {

  constructor (initialState, store, preHandler = (() => true)) {
    this.state = [initialState]
    this.pre = preHandler
    this.store = store
  }

  // May be use another type of state management
  learn (name, func) {
    this.store[name] = func
  }

  work (arr) {
    arr.forEach(item => {
      if (!this.pre({item}))
        return

      this.top({
        item,
        machine: this,
        store: this.store
      })
    })
  }

  top (arg) {
    this.state[this.state.length - 1](arg)
  }

  push (handler) {
    this.state.push(handler)
  }

  pop(){
    this.state.pop()
  }
}