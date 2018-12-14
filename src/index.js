const core = require('./core')
const {promisify} = require('util')
const fs = require('fs')
const path = require('path')
const mkDir = require('make-dir')
const config = require('../config.json')
const airSyntaxDefinitions = require('./SyntaxDefinitions/air')

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

export default function build() {
  readFileAsync(path.resolve('./' + config.source.folder + '/' + config.source.index), 'utf8')
      .then((text) => core(text,airSyntaxDefinitions, true))
      .then(data => data.toJS())
      .then(text => {
        console.log("TEXT:\n", text)
        let buildFolder = path.resolve('./' + config.target.folder)
        return new Promise((resolve, reject) => {
          fs.stat(buildFolder, err => {
            if (!err) {
              return resolve(text)
            }
            fs.mkdir(buildFolder, err => {
              if (err) {
                console.error('Cannot create build folder ')
                reject(err)
              }
              resolve(text)
            })
          })
        })
      })
      .then(text => {
        mkDir(path.resolve('./' + config.target.folder))
        return writeFileAsync(path.resolve('./' + config.target.folder + '/' + config.target.index), text, 'utf8')
      })
      .catch(err => {
        console.error(err)
      })
}

export async function airToJs(text){
  const data = await core(text, airSyntaxDefinitions)
  return data.toJS()
}



