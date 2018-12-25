import {LearningItem, LearningStateHandler} from "../../StateMachine";

export enum SyntaxDefinitionType {
    AFTER = 'AFTER',
    HAVE = 'HAVE',
    OR_MORE = 'OR_MORE',
    OTHER = 'OTHER'
}

export interface SyntaxDefinitionObject {
    key?: string | RegExp | LearningStateHandler<SyntaxStore>
    have?: Array<string>
    maybe?: Array<string>
    after?: Array<string>
    next?: string
    end?: string
    like?: string
    is?: string
    as?: string
    zeroOrMore?: Array<string>
    oneOrMore?: Array<string>
}

export interface SyntaxDefinitions {
    [token: string]: SyntaxDefinitionObject
}

export interface SyntaxField {
    key: string
    value: string
}

export interface SyntaxBranch {
    token?: string
    type?: string
    tree?: Array<SyntaxBranch>
    value?: string
    item?: LearningItem
    branch?: SyntaxBranch
    fields?: Array<SyntaxField>
    end?: boolean
}

export interface SyntaxStore {
    tree: Array<SyntaxBranch>
    branch: SyntaxBranch
}