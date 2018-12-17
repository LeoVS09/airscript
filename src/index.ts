import core, {Interpreter} from './core'
import {promisify} from 'util'
import * as fs from 'fs'
import * as path from 'path'
import mkDir from 'make-dir'
import config from '../config.json'
import airSyntaxDefinitions from './SyntaxDefinitions/air'

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

export default function build() {
  readFileAsync(path.resolve('./' + config.source.folder + '/' + config.source.index), 'utf8')
      .then((text: string) => core(text, airSyntaxDefinitions, true))
      .then((data: Interpreter) => data.toJS())
      .then((text: string) => {
        console.log("TEXT:\n", text)
        let buildFolder = path.resolve('./' + config.target.folder)
        return new Promise((resolve, reject) => {
          fs.stat(buildFolder, (err: any) => {
            if (!err) {
              return resolve(text)
            }
            fs.mkdir(buildFolder, (err: any) => {
              if (err) {
                console.error('Cannot create build folder ')
                reject(err)
              }
              resolve(text)
            })
          })
        })
      })
      .then((text: string) => {
        mkDir(path.resolve('./' + config.target.folder))
        return writeFileAsync(path.resolve('./' + config.target.folder + '/' + config.target.index), text, 'utf8')
      })
      .catch((err: any) => {
        console.error(err)
      })
}

export async function airToJs(text: string, debug?: boolean){
  const data = await core(text, airSyntaxDefinitions, debug)
  return await data.toJS()
}



