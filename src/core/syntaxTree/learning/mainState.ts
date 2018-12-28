import {LearningStateHandlerArgs} from "../../stateMachine";
import {constants as tokens} from "../../tokens";
import {SyntaxStore} from "./types";

export function main({store, machine, item}: LearningStateHandlerArgs<SyntaxStore>) {
    if (machine.isKnow(tokens.EMPTY_LINE, item)) {
        if(!store.tree) {
            store.tree = []
        }
        return store.tree.push({
            token: tokens.EMPTY_LINE,
            item,
            end: true
        })
    }

    const preDefinedFunction = machine.isKnow(tokens.PRE_DEFINED_FUNCTIONS, item)

    if(preDefinedFunction) {
        console.log('isKnow', item, 'to', tokens.PRE_DEFINED_FUNCTIONS)
        return machine.nextState(preDefinedFunction)
    }

    if (machine.isKnow(tokens.VARIABLE, item)) {
        console.log('isKnow', item, 'to', tokens.VARIABLE)
        return machine.nextState(tokens.VARIABLE)
    }

    if(machine.isKnow(tokens.FUNCTION_DEFINITION, item)) {
        console.log('isKnow', item, 'to', tokens.FUNCTION_DEFINITION)
        return machine.nextState(tokens.FUNCTION_DEFINITION)
    }

    if(machine.isKnow(tokens.ACTION, item)) {
        console.log('isKnow', item, 'to', tokens.ACTION)
        return machine.nextState(tokens.ACTION)
    }

    if(machine.isKnow(tokens.FUNCTION_DEFINITION, item)) {
        console.log('isKnow', item, 'to', tokens.FUNCTION_DEFINITION)
        return machine.nextState(tokens.FUNCTION_DEFINITION)
    }



    console.error('[UNEXPECTED TOKEN]', item)

}