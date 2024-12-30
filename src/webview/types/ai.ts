export const OPENAI_MODELS = {
    GPT4: 'gpt-4',
    GPT4_TURBO: 'gpt-4-turbo',
    GPT4O: 'gpt-4o',
    GPT4O_MINI: 'gpt-4o-mini',
    O1: 'o1',
    O1_MINI: 'o1-mini',
    O1_PREVIEW: 'o1-preview',
} as const;

export const CLAUDE_MODELS = {
    OPUS: 'claude-3-opus',
    HAIKU: 'claude-3.5-haiku',
    SONNET: 'claude-3.5-sonnet',
    SONNET_20241022: 'claude-3.5-sonnet-20241022',
} as const;

export type OpenAIModel = (typeof OPENAI_MODELS)[keyof typeof OPENAI_MODELS];
export type ClaudeModel = (typeof CLAUDE_MODELS)[keyof typeof CLAUDE_MODELS];
export type AIModel = OpenAIModel | ClaudeModel;

export const AI_MODELS = {
    openai: Object.values(OPENAI_MODELS),
    claude: Object.values(CLAUDE_MODELS),
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

export interface BaseAIConfig {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    temperature?: number;
    maxTokens?: number;
    maxHistoryLength?: number;
    maxContextMessages?: number;
}

export interface OpenAIConfig extends BaseAIConfig {
    model: OpenAIModel;
}

export interface ClaudeConfig extends BaseAIConfig {
    model: ClaudeModel;
}

export type AIConfig = OpenAIConfig | ClaudeConfig;

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

export interface BaseCommandParams {
    message?: string;
    images?: string[];
    files?: AttachedFile[];
}

export interface ChatParams extends BaseCommandParams {
    message: string;
}

export interface CodeParams extends BaseCommandParams {
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
