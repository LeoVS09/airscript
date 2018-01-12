const core = require('./core')
const {promisify} = require('util')
const fs = require('fs')
const path = require('path')
const config = require('../config.json')

promisify(fs.readFile)(path.resolve('./' + config.source.folder + '/' + config.source.index), 'utf8')
  .then((text) => core(text))
  .then(data => data.toJS())
  .then(text => {
    console.log(text)
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
    return promisify(fs.writeFile)(path.resolve('./' + config.target.folder + '/' + config.target.index), text, 'utf8')
  })
  .catch(err => {
    console.error(err)
  })

