const constants = require('../tokens')
const {StateMachine} = require('./StateMachine')

function main ({item: token, machine, store}) {
  if (token.key === 'VARIABLE') {
    store.branch = {key: 'VARIABLE'}
    machine.push(variable)
  }
}

function variable ({item: token, machine, store}) {
  if (token.key === 'WORD') {
    store.branch.value = token.value
    machine.push(value)
  }
}

function value ({item: token, machine, store}) {
  if (token === constants.END_LINE) {
    store.branch.fields = []
    store.branch.type = 'OBJECT'
    machine.push(valueObject)
  }
}

function valueObject ({item: token, machine}) {
  if (token === constants.INCREASE_NESTING) {
    machine.push(valueObjectName)
  }
}

function valueObjectName ({item: token, machine, store}) {
  if (token.key === 'WORD') {
    store.current = {key: token.value}
    machine.push(valueObjectValue)
  }
  if (token === constants.DECREASE_NESTING) {
    store.tree.push(store.branch)
    store.branch = {}
    machine.push(main)
  }
}

function valueObjectValue ({item: token, machine, store}) {
  store.current.value = token.value
  store.current.type = token.key
  store.branch.fields.push(store.current)
  store.current = {}
  machine.push(waitNextField)
}

function waitNextField ({item: token, machine}) {
  if (token === constants.END_LINE) {
    machine.push(valueObjectName)
  }
}

function empty ({item: token, store}) {
  if (token === constants.EMPTY_LINE) {
    store.tree.push({key: 'EMPTY'})
    return false
  }
  return true
}

module.exports = function (tokens) {
  let store = {
    tree: [],
    branch: {},
    current: {}
  }

  const builder = new StateMachine(main, store)
  builder.work(tokens)

  if (store.branch.key) {
    store.tree.push(store.branch)
  }

  return store.tree
}
