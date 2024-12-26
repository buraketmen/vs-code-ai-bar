export type Message = {
    id: string;
    text: string;
    role: 'user' | 'assistant';
    timestamp: string;
    isError?: boolean;
};

export type ChatSession = {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
    lastUpdatedAt: string;
};

export type ChatState = {
    sessions: ChatSession[];
    currentSessionId: string | null;
};

export type ChatActions = {
    onSelectSession: (sessionId: string) => void;
    onNewChat: () => void;
    onRenameSession: (sessionId: string, newTitle: string) => void;
    onDeleteSession: (sessionId: string) => void;
};

export type ChatGPTModel = 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
export type ClaudeModel = 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229';
export type AIModel = ChatGPTModel | ClaudeModel;

export const AI_MODELS = {
    chatgpt: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] as ChatGPTModel[],
    claude: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'] as ClaudeModel[],
} as const;

export enum TimeGroup {
    JUST_NOW = 'Just Now',
    LAST_HOUR = 'Last Hour',
    LAST_3_HOURS = 'Last 3 Hours',
    LAST_24_HOURS = 'Last 24 Hours',
    LAST_WEEK = 'Last Week',
    LAST_MONTH = 'Last Month',
    OLDER = 'Older',
}

export type GroupedSessions = {
    [key in TimeGroup]?: ChatSession[];
};
