import {LearningStateMachine} from "../../stateMachine";
import {SyntaxDefinitions, SyntaxDefinitionObject, SyntaxStore} from "./types";
import {createStore} from "./store";
import {main} from "./mainState";
import {teach} from "./teach";

export {
    SyntaxDefinitions,
    SyntaxDefinitionObject
}

export default function (syntaxDefinitions: SyntaxDefinitions): LearningStateMachine<SyntaxStore> {
    let store = createStore()

    let bot = new LearningStateMachine<SyntaxStore>(main, store)

    teach(bot, syntaxDefinitions)

    console.log('Learned states:\n', bot.states)

    return bot
}