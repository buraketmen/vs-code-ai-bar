export type ChatGPTModel = 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
export type ClaudeModel = 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229';
export type AIModel = ChatGPTModel | ClaudeModel;

export const AI_MODELS = {
    chatgpt: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] as ChatGPTModel[],
    claude: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'] as ClaudeModel[],
} as const;

export type Role = 'system' | 'user' | 'assistant';

export enum AICommand {
    OPTIMIZE_CODE = 'optimize_code',
    SECURITY_CHECK = 'security_check',
    TEST_COVERAGE = 'test_coverage',
    EXPLAIN_CODE = 'explain_code',
    REFACTOR_CODE = 'refactor_code',
    ADD_TYPES = 'add_types',
    ADD_DOCUMENTATION = 'add_documentation',
    FIX_BUGS = 'fix_bugs',
    SUGGEST_IMPROVEMENTS = 'suggest_improvements',
    CHAT = 'chat',
}

export interface AIConfig {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    maxHistoryLength?: number;
    maxContextMessages?: number;
}

export interface AIResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface Message {
    role: Role;
    content: string;
}

export interface CommandPrompt {
    command: AICommand;
    systemPrompt: string;
    userPromptTemplate: string;
}

export interface ChatParams {
    message: string;
}

export interface CodeParams {
    code: string;
}

export interface CodeWithFocusParams extends CodeParams {
    focus: string;
}

export interface TestCoverageParams extends CodeParams {
    testFiles: string;
}

export interface AttachedFile {
    id: string;
    name: string;
    path?: string;
    type: 'file' | 'snippet';
    content: string;
    startLine?: number;
    endLine?: number;
}

export type CommandParams = {
    [AICommand.CHAT]: ChatParams;
    [AICommand.OPTIMIZE_CODE]: CodeWithFocusParams;
    [AICommand.SECURITY_CHECK]: CodeParams;
    [AICommand.TEST_COVERAGE]: TestCoverageParams;
    [AICommand.EXPLAIN_CODE]: CodeParams;
    [AICommand.REFACTOR_CODE]: CodeWithFocusParams;
    [AICommand.ADD_TYPES]: CodeParams;
    [AICommand.ADD_DOCUMENTATION]: CodeParams;
    [AICommand.FIX_BUGS]: CodeParams;
    [AICommand.SUGGEST_IMPROVEMENTS]: CodeParams;
};