import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ChatSession, ChatState, Message } from '../types';
import { getTimeGroup, TimeGroup } from '../utils/time';

type ChatContextType = {
    sessions: ChatSession[];
    currentSession: ChatSession | undefined;
    currentSessionId: string | null;
    isTyping: boolean;
    createNewChat: () => void;
    sendMessage: (text: string) => void;
    selectSession: (sessionId: string) => void;
    renameSession: (sessionId: string, newTitle: string) => void;
    deleteSession: (sessionId: string) => void;
    getGroupedSessions: (searchQuery: string) => { [key in TimeGroup]?: ChatSession[] };
};

const ChatContext = createContext<ChatContextType | null>(null);

const generateId = () => Math.random().toString(36).substring(2, 15);

const createNewSession = (firstMessage?: string): ChatSession => ({
    id: generateId(),
    title: firstMessage ? `${firstMessage.slice(0, 20)}...` : 'New Chat',
    messages: [
        {
            text: 'Hello! I am your VS Code AI assistant. How can I help you today?',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
        },
    ],
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [chatState, setChatState] = useState<ChatState>(() => {
        // Try to load saved state
        const savedState = window.vscode.getState() as ChatState | undefined;

        if (savedState && savedState.sessions && savedState.sessions.length > 0) {
            return savedState;
        }

        // If no saved state, create initial session
        const initialSession = createNewSession();
        return {
            sessions: [initialSession],
            currentSessionId: initialSession.id,
        };
    });

    const [isTyping, setIsTyping] = useState(false);

    // Save state whenever it changes
    useEffect(() => {
        window.vscode.setState(chatState);
    }, [chatState]);

    const currentSession = chatState.sessions.find((s) => s.id === chatState.currentSessionId);

    const updateSession = useCallback(
        (sessionId: string, updater: (session: ChatSession) => ChatSession) => {
            setChatState((prev) => ({
                ...prev,
                sessions: prev.sessions.map((s) => (s.id === sessionId ? updater(s) : s)),
            }));
        },
        []
    );

    const createNewChat = useCallback(() => {
        const newSession = createNewSession();
        setChatState((prev) => ({
            sessions: [...prev.sessions, newSession],
            currentSessionId: newSession.id,
        }));
    }, []);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || !chatState.currentSessionId) return;

            const userMessage: Message = {
                text,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString(),
            };

            // If this is the first user message, update the session title
            const session = chatState.sessions.find((s) => s.id === chatState.currentSessionId);
            if (session && session.messages.length === 1) {
                updateSession(chatState.currentSessionId, (s) => ({
                    ...s,
                    title: `${text.slice(0, 20)}...`,
                }));
            }

            updateSession(chatState.currentSessionId, (s) => ({
                ...s,
                messages: [...s.messages, userMessage],
                lastUpdatedAt: new Date().toISOString(),
            }));

            setIsTyping(true);

            // Simulated AI response
            setTimeout(() => {
                const aiResponse: Message = {
                    text: 'This is a sample response. Real AI integration will be added later.',
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString(),
                };
                updateSession(chatState.currentSessionId!, (s) => ({
                    ...s,
                    messages: [...s.messages, aiResponse],
                    lastUpdatedAt: new Date().toISOString(),
                }));
                setIsTyping(false);
            }, 1500);
        },
        [chatState.currentSessionId, chatState.sessions, updateSession]
    );

    const selectSession = useCallback((sessionId: string) => {
        setChatState((prev) => ({
            ...prev,
            currentSessionId: sessionId,
        }));
    }, []);

    const renameSession = useCallback(
        (sessionId: string, newTitle: string) => {
            updateSession(sessionId, (s) => ({
                ...s,
                title: newTitle,
            }));
        },
        [updateSession]
    );

    const deleteSession = useCallback(
        (sessionId: string) => {
            if (sessionId === chatState.currentSessionId) return;

            setChatState((prev) => ({
                ...prev,
                sessions: prev.sessions.filter((s) => s.id !== sessionId),
            }));
        },
        [chatState.currentSessionId]
    );

    const getGroupedSessions = useCallback(
        (searchQuery: string) => {
            // Filter sessions based on search query
            let filtered = chatState.sessions;
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                filtered = filtered.filter(
                    (session) =>
                        session.title.toLowerCase().includes(query) ||
                        session.messages.some((msg) => msg.text.toLowerCase().includes(query))
                );
            }

            // Group by time period
            const groups = filtered.reduce(
                (groups, session) => {
                    const group = getTimeGroup(session.lastUpdatedAt);
                    if (!groups[group]) {
                        groups[group] = [];
                    }
                    groups[group].push(session);
                    return groups;
                },
                {} as { [key in TimeGroup]?: ChatSession[] }
            );

            // Sort sessions within each group
            Object.values(groups).forEach((sessions) => {
                if (sessions) {
                    sessions.sort(
                        (a, b) =>
                            new Date(b.lastUpdatedAt).getTime() -
                            new Date(a.lastUpdatedAt).getTime()
                    );
                }
            });

            return groups;
        },
        [chatState.sessions]
    );

    const value = {
        sessions: chatState.sessions,
        currentSession,
        currentSessionId: chatState.currentSessionId,
        isTyping,
        createNewChat,
        sendMessage,
        selectSession,
        renameSession,
        deleteSession,
        getGroupedSessions,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};
