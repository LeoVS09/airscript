const StateMachine = require('./StateMachine')

function start ({item, machine, store}) {
  if (item === ' ' || item === '\t') {
    store.tabs++
  } else {
    store.current += item
    if (item === '\'' || item === '\"' || item === '`') {
      store.stringSymbol = item
      return machine.push(str)
    } else {
      return machine.push(word)
    }
  }
}

function main ({item, machine, store}) {
  if (item !== ' ') {
    store.current += item
    if (item === '\'' || item === '\"' || item === '`') {
      store.stringSymbol = item
      return machine.push(str)
    } else {
      return machine.push(word)
    }
  }
}

function str ({item, machine, store}) {
  store.current += item
  if (item === store.stringSymbol) {
    store.words.push(store.current)
    store.current = ''
    return machine.push(main)
  }
}

function word ({item, machine, store}) {
  if (item === ' ') {
    store.words.push(store.current)
    store.current = ''
    return machine.push(main)
  } else {
    store.current += item
  }
  //console.debug('resolve word: ', item, ' current: ', current)
}

// parse string and find count tabs or spaces on start, all words, and empty bool
module.exports =
  function resolve (string) {

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