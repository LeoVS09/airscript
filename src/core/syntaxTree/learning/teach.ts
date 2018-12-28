import {LearningStateMachine} from "../../stateMachine";
import { SyntaxDefinitions, SyntaxDefinitionType, SyntaxStore, tokenType} from "./types";
import {
    learnOrMore,
    learnHave,
    learnKeys,
    learnAfter
} from './learn'

export function teach(bot: LearningStateMachine<SyntaxStore>, syntaxDefinitions: SyntaxDefinitions) {

    Object.keys(syntaxDefinitions).forEach(tokenName => {
        learnKeys(tokenName, bot, syntaxDefinitions)

        const defined = syntaxDefinitions[tokenName]

        switch (tokenType(defined)) {
            case SyntaxDefinitionType.AFTER:
                return learnAfter(tokenName, bot, syntaxDefinitions)

            case SyntaxDefinitionType.HAVE:
                return learnHave(tokenName, bot, syntaxDefinitions)

            case SyntaxDefinitionType.OR_MORE:
                return learnOrMore(tokenName, bot, syntaxDefinitions)

            default:
                return
        }
    })
}