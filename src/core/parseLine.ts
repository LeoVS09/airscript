import {StateMachine, StateHandlerArgs} from "./StateMachine";

export interface Store {
  words: Array<string>,
  current: string,
  tabs: number,
  isEmpty: boolean,
  stringSymbol: string
}

// parse string and find count tabs or spaces on start, all words, and empty bool
export default function (string: string): Store {

  let store = {
    words: [],
    current: '',
    tabs: 0,
    isEmpty: true,
    stringSymbol: ''
  } as Store

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

function start (parameters: StateHandlerArgs<Store, string>) {
  if (parameters.item === ' ' || parameters.item === '\t') {
    parameters.store.tabs++
  } else {
    main(parameters)
  }
}

function main ({item, machine, store}: StateHandlerArgs<Store, string>) {
  if (item === ' ') {
    return
  }

  store.current += item

  if (item === '\'' || item === '\"' || item === '`') {
    store.stringSymbol = item
    machine.push(inString)
    return
  }

  machine.push(word)
}

function inString ({item, machine, store}: StateHandlerArgs<Store, string>) {
  store.current += item

  if (item === '\\') {
    machine.push(inStringAfterBackslash)
    return
  }

  if (item === store.stringSymbol) {
    store.words.push(store.current)
    store.current = ''
    machine.push(main)
  }
}

function inStringAfterBackslash ({item, machine, store}: StateHandlerArgs<Store, string>) {
  store.current += item
  machine.pop()
}

function word ({item, machine, store}: StateHandlerArgs<Store, string>) {
  if (item !== ' ') {
    store.current += item
    return
  }

  store.words.push(store.current)
  store.current = ''
  machine.push(main)
  //console.debug('resolve word: ', item, ' current: ', current)
}

