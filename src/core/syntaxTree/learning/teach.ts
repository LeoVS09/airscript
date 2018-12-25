import {LearningStateHandlerArgs, LearningStateMachine} from "../../StateMachine";
import {isToken} from "../../tokens";
import {SyntaxDefinitionObject, SyntaxDefinitions, SyntaxDefinitionType, SyntaxStore} from "./types";
import learnKeys from './learnKeys'
import learnAfter from "./learnAfter";
import learnHave from "./learnHave";
import learnOrMore from "./learnOrMore";

function tokenType(defined: SyntaxDefinitionObject): SyntaxDefinitionType {
    if(defined.after) {
        return SyntaxDefinitionType.AFTER
    }

    if(defined.have) {
        return SyntaxDefinitionType.HAVE
    }

    if(defined.zeroOrMore || defined.oneOrMore) {
        return SyntaxDefinitionType.OR_MORE
    }

    return SyntaxDefinitionType.OTHER
}

export function teach(bot: LearningStateMachine<SyntaxStore>, syntaxDefinitions: SyntaxDefinitions) {

    Object.keys(syntaxDefinitions).forEach(tokenName => {
        const defined = syntaxDefinitions[tokenName]

        learnKeys(tokenName, bot, syntaxDefinitions)

        switch (tokenType(defined)) {
            case SyntaxDefinitionType.AFTER:
                learnAfter(tokenName, bot, syntaxDefinitions)
                return

            case SyntaxDefinitionType.HAVE:
                learnHave(tokenName, bot, syntaxDefinitions)
                return

            case SyntaxDefinitionType.OR_MORE:
                learnOrMore(tokenName, bot, syntaxDefinitions)
                return

            default:
                return
        }
    })
}