export type Message = {
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
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
