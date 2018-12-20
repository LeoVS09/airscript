import {constants as tokens} from '../core/tokens'
import {syntaxTree} from '../core'

const air: syntaxTree.SyntaxDefinitions = {
    [tokens.EMPTY_LINE]: {
        is: tokens.EMPTY_LINE
    },
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
            tokens.OBJECT
        ]
    },
    // -----TYPES-------
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
        key: /^(['"])(.*?)([^\\]?)\1/
    },
    [tokens.OBJECT]: {
        after: [
            tokens.END_LINE,
            tokens.INCREASE_NESTING
        ],
        have: [
            tokens.OBJECT_FIELD_NAME,
            tokens.OBJECT_FIELD_VALUE
        ],
        end: tokens.DECREASE_NESTING
    },
    [tokens.OBJECT_FIELD_NAME]: {
        like: tokens.VARIABLE_NAME
    },
    [tokens.OBJECT_FIELD_VALUE]: {
        like: tokens.VARIABLE_VALUE
    },
    // -----OPERANDS-------
    [tokens.ASSIGMENT]: {
        key: /^(([+\-\*\/%&^\|]|<{2}|>{2,3})?=)$/
    },
    [tokens.OPERATION]: {
        key: /^(\*{2}|\+{2}|\-{2}|={2,3}|!?={1,2}|[<>]=|&{2}|\|{2}|[><+\-*/%\&\|])$/,
    },
    [tokens.OPERAND]: {
        maybe: [
            tokens.STRING,
            tokens.INFINITY,
            tokens.BOOLEAN,
            tokens.FLOAT,
            tokens.INTEGER
        ]
    },
    [tokens.OPERAND_GROUP_START]: {
        key: '('
    },
    [tokens.OPERAND_GROUP_END]: {
        key: ')'
    },

    // -----FUNCTION-------
    [tokens.ACTION]: {
        as: tokens.VARIABLE_NAME,
        have: [
            tokens.ASSIGMENT,
            tokens.ACTION_BODY
        ]
    },

    [tokens.ACTION_BODY]: {
        oneOrMore: [
            tokens.OPERATION,
            tokens.OPERAND_GROUP_START,
            tokens.OPERAND_GROUP_END,
            tokens.OPERAND,
            tokens.VARIABLE_NAME
        ],
        end: tokens.END_LINE
    },
    // [tokens.END_LINE]: {
    //   key: tokens.END_LINE
    // },

    [tokens.FUNCTION_DEFINITION]: {
        key: 'function',
        have: [
            tokens.FUNCTION_DEFINE,
            tokens.FUNCTION_BODY
        ]
    },

    [tokens.FUNCTION_DEFINE]: {
        zeroOrMore: [
            tokens.FUNCTION_DEFINE_OPERAND,
            tokens.FUNCTION_DEFINE_ARG,
        ],
        end: tokens.END_LINE
    },
    [tokens.FUNCTION_DEFINE_ARG]: {
        key: /^\w+$/
    },
    [tokens.FUNCTION_DEFINE_OPERAND]: {
        key: /^(and|or|as|on|when|where|to|in|do|inside)$/
    },
    [tokens.FUNCTION_BODY]: {
        after: [
            tokens.END_LINE,
            tokens.INCREASE_NESTING
        ],
        zeroOrMore: [
            tokens.VARIABLE,
            tokens.OPERATION
        ],
        end: tokens.DECREASE_NESTING
    },



}

export default air