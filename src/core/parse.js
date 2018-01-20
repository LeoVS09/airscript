const {StateMachine} = require('./StateMachine')

function start (parameters) {
  if (parameters.item === ' ' || parameters.item === '\t') {
    parameters.store.tabs++
  } else {
    main(parameters)
  }
}

function main ({item, machine, store}) {
  if (item !== ' ') {
    store.current += item
    if (item === '\'' || item === '\"' || item === '`') {
      store.stringSymbol = item
      machine.push(inString)
    } else {
      machine.push(word)
    }
  }
}

function inString ({item, machine, store}) {
  store.current += item
  if (item === '\\') {
    machine.push(inStringAfterBackslash)
  } else if (item === store.stringSymbol) {
    store.words.push(store.current)
    store.current = ''
    machine.push(main)
  }
}

function inStringAfterBackslash ({item, machine, store}) {
  store.current += item
  machine.pop()
}

function word ({item, machine, store}) {
  if (item === ' ') {
    store.words.push(store.current)
    store.current = ''
    machine.push(main)
  } else {
    store.current += item
  }
  //console.debug('resolve word: ', item, ' current: ', current)
}

// parse string and find count tabs or spaces on start, all words, and empty bool
module.exports = function (string) {

  let store = {
    words: [],
    current: '',
    tabs: 0,
    isEmpty: true,
    stringSymbol: ''
  }

  if (string.length === 0)
    return store

  const resolver = new StateMachine(start, store, ({item}) => item !== '\r')
  resolver.work(string.split(''))

  if (store.current.length !== 0) {
    store.words.push(store.current)
    store.current = ''
  }

  store.isEmpty = store.words.length === 0

  return store
}