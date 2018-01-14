const constants = require('../tokens')


function understand (value) {
  return value
}

module.exports = class {
  constructor (){
    this.lastTabs = 0
    this.build = this.build.bind(this)
  }

  build({tabs, words, isEmpty}){
    let tokens = []

    if (isEmpty && tokens.length > 0 && tokens[tokens.length - 1] !== constants.EMPTY_LINE) {
      tokens.push(constants.EMPTY_LINE)
      return tokens
    }
    if (tabs > this.lastTabs)
      tokens.push(constants.INCREASE_NESTING)
    else if (tabs < this.lastTabs)
      tokens.push(constants.DECREASE_NESTING)
    this.lastTabs = tabs

    let understood = words.map(understand)
    tokens.push(...understood)

    tokens.push(constants.END_LINE)

    return tokens
  }

}

