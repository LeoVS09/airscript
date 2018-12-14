import {constants as tokens} from '../core/tokens'
import {syntaxTree} from '../core'

const air: syntaxTree.SyntaxDefinitions = {
  [tokens.VARIABLE]: {
    key: 'var',
    have: [
      tokens.VARIABLE_NAME,
      tokens.VARIABLE_VALUE
      ]
  },
  [tokens.VARIABLE_NAME]: {
    key: /^\w+$/
  },
  [tokens.VARIABLE_VALUE]: {
    maybe: [
      tokens.STRING,
      tokens.INFINITY,
      tokens.BOOLEAN,
      tokens.FLOAT,
      tokens.INTEGER,
      // tokens.OBJECT
    ]
  },
  [tokens.BOOLEAN]: {
    key: /^(true|false)$/
  },
  [tokens.INTEGER]: {
    key: /^(\-|\+)?([0-9]+)$/,
  },
  [tokens.FLOAT]: {
     key: /^(\-|\+)?([0-9]+\.([0-9]+)?)$/,
  },
  [tokens.INFINITY]: {
     key: /^(\-|\+)?(|Infinity)$/
  },
  [tokens.STRING]: {
    key: /^(['"])(.*?)([^\\])\1/
  },
  // [tokens.OBJECT]: {
  //   before: [
  //     tokens.END_LINE,
  //     tokens.INCREASE_NESTING
  //   ],
  //   next: tokens.OBJECT_FIELD_NAME,
  //   end: tokens.DECREASE_NESTING
  // },
  // [tokens.OBJECT_FIELD_NAME]: {
  //   like: tokens.VARIABLE_NAME,
  //   next: tokens.OBJECT_FIELD_VALUE
  // },
  // [tokens.OBJECT_FIELD_VALUE]: {
  //   like: tokens.VARIABLE_VALUE
  // }
}

export default air