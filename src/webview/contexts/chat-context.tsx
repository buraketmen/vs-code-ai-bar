import * as React from 'react';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react';
import { AIManager } from '../ai/ai-manager';
import { ChatNotification } from '../components/notification';
import { AICommand, AIModel, AttachedFile } from '../types/ai';
import { ChatSession, ChatState, GroupedSessions, Message } from '../types/chat';
import {
    createMessage,
    FileOperationData,
    VSCodeMessageType,
    WorkspacePathData,
} from '../types/events';
import { generateUUID } from '../utils/helpers';
import { getTimeGroup } from '../utils/time';

interface ChatContextType {
    sessions: ChatSession[];
    currentSession: ChatSession | null;
    currentSessionId: string | null;
    isTyping: boolean;
    canUndo: boolean;
    canRedo: boolean;
    attachedFiles: AttachedFile[];
    selectedFile: AttachedFile | undefined;
    selectSession: (sessionId: string) => void;
    createNewChat: () => void;
    chatWithAI: (text: string, model: AIModel, command: AICommand) => void;
    renameSession: (sessionId: string, newTitle: string) => void;
    deleteSession: (sessionId: string) => void;
    undoDelete: () => void;
    redoDelete: () => void;
    getGroupedSessions: (searchQuery: string) => GroupedSessions;
    handleAttachFile: (file: Omit<AttachedFile, 'id'>) => void;
    handleRemoveFile: (fileId: string) => void;
    setSelectedFile: (file: AttachedFile | undefined) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);
const CHAT_DEFAULT_TITLE: string = 'New Chat';

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};

type ChatAction =
    | { type: 'SET_SESSIONS'; sessions: ChatSession[] }
    | { type: 'SET_CURRENT_SESSION'; sessionId: string | null }
    | { type: 'UPDATE_SESSION'; sessionId: string; updater: (session: ChatSession) => ChatSession }
    | { type: 'DELETE_SESSION'; sessionId: string }
    | { type: 'RESTORE_SESSION'; session: ChatSession };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case 'SET_SESSIONS':
            return {
                ...state,
                sessions: action.sessions,
            };
        case 'SET_CURRENT_SESSION':
            return {
                ...state,
                currentSessionId: action.sessionId,
            };
        case 'UPDATE_SESSION':
            return {
                ...state,
                sessions: state.sessions.map((session) =>
                    session.id === action.sessionId ? action.updater(session) : session
                ),
            };
        case 'DELETE_SESSION':
            return {
                ...state,
                sessions: state.sessions.filter((session) => session.id !== action.sessionId),
            };
        case 'RESTORE_SESSION':
            return {
                ...state,
                sessions: [...state.sessions, action.session],
            };
        default:
            return state;
    }
}

interface ChatProviderProps {
    children: React.ReactNode;
    initialState?: {
        sessions: ChatSession[];
        currentSessionId: string | null;
    };
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children, initialState }) => {
    const [chatState, dispatch] = useReducer(chatReducer, {
        sessions: initialState?.sessions || [],
        currentSessionId: initialState?.currentSessionId || null,
    });

    const [isTyping, setIsTyping] = useState(false);
    const [deletedSessions, setDeletedSessions] = useState<ChatSession[]>([]);
    const [redoStack, setRedoStack] = useState<ChatSession[]>([]);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<AttachedFile | undefined>();
    const [workspacePath, setWorkspacePath] = useState<string>('');

    const aiManager = AIManager.getInstance();

    useEffect(() => {
        window.vscode.postMessage(createMessage(VSCodeMessageType.GET_WORKSPACE_PATH));
        const handleWorkspaceMessage = (event: MessageEvent) => {
            const { type, data } = event.data;
            if (type === VSCodeMessageType.WORKSPACE_PATH) {
                const { path } = data as WorkspacePathData;
                setWorkspacePath(path);
            }
        };
        window.addEventListener('message', handleWorkspaceMessage);
        return () => window.removeEventListener('message', handleWorkspaceMessage);
    }, []);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const { type, data } = event.data;
            if (type === VSCodeMessageType.FILE_DELETED) {
                const { path } = data as FileOperationData;
                setAttachedFiles((prev) => prev.filter((file) => file.path !== path));
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [workspacePath, selectedFile]);

    useEffect(() => {
        // Load saved sessions from VS Code storage
        const savedState = window.vscode.getState();
        if (savedState?.sessions) {
            dispatch({ type: 'SET_SESSIONS', sessions: savedState.sessions });
            if (savedState.currentSessionId) {
                dispatch({ type: 'SET_CURRENT_SESSION', sessionId: savedState.currentSessionId });
            }
        }
    }, []);

    useEffect(() => {
        // Save sessions to VS Code storage
        const currentState = window.vscode.getState() || {};
        window.vscode.setState({
            ...currentState,
            sessions: chatState.sessions,
            currentSessionId: chatState.currentSessionId,
        });
    }, [chatState.sessions, chatState.currentSessionId]);

    useEffect(() => {
        if (chatState.sessions.length === 0) {
            const newSession: ChatSession = {
                id: Date.now().toString(),
                title: CHAT_DEFAULT_TITLE,
                messages: [],
                createdAt: new Date().toISOString(),
                lastUpdatedAt: new Date().toISOString(),
            };
            dispatch({ type: 'RESTORE_SESSION', session: newSession });
            dispatch({ type: 'SET_CURRENT_SESSION', sessionId: newSession.id });
        } else if (!chatState.currentSessionId) {
            // If there are sessions but no current session, select the most recent one
            const mostRecentSession = [...chatState.sessions].sort(
                (a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
            )[0];
            dispatch({ type: 'SET_CURRENT_SESSION', sessionId: mostRecentSession.id });
        }
    }, [chatState.sessions.length, chatState.currentSessionId]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const { type } = event.data;
            if (type === VSCodeMessageType.CLEAR_STATE) {
                // Clear all state
                dispatch({ type: 'SET_SESSIONS', sessions: [] });
                dispatch({ type: 'SET_CURRENT_SESSION', sessionId: null });
                setDeletedSessions([]);
                setRedoStack([]);
                setAttachedFiles([]);
                setSelectedFile(undefined);

                // Create a new default session
                const newSession: ChatSession = {
                    id: Date.now().toString(),
                    title: CHAT_DEFAULT_TITLE,
                    messages: [],
                    createdAt: new Date().toISOString(),
                    lastUpdatedAt: new Date().toISOString(),
                };
                dispatch({ type: 'RESTORE_SESSION', session: newSession });
                dispatch({ type: 'SET_CURRENT_SESSION', sessionId: newSession.id });
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const selectSession = useCallback(
        (sessionId: string) => {
            const session = chatState.sessions.find((s) => s.id === sessionId);
            if (session) {
                dispatch({ type: 'SET_CURRENT_SESSION', sessionId });
            }
        },
        [chatState.sessions]
    );

    const createNewChat = useCallback(() => {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: CHAT_DEFAULT_TITLE,
            messages: [],
            createdAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
        };

        dispatch({ type: 'RESTORE_SESSION', session: newSession });
        dispatch({ type: 'SET_CURRENT_SESSION', sessionId: newSession.id });
    }, []);

    const updateSession = useCallback(
        (sessionId: string, updater: (session: ChatSession) => ChatSession) => {
            dispatch({ type: 'UPDATE_SESSION', sessionId, updater });
        },
        []
    );

    const chatWithAI = useCallback(
        async (text: string, model: AIModel, command: AICommand) => {
            if (!text.trim() || !chatState.currentSessionId) return;

            const userMessage: Message = {
                id: Date.now().toString(),
                text,
                role: 'user',
                timestamp: new Date().toLocaleTimeString(),
            };

            const session = chatState.sessions.find((s) => s.id === chatState.currentSessionId);
            if (session && session.title === CHAT_DEFAULT_TITLE) {
                const words = text.trim().split(/\s+/);
                const firstThreeWords = words.slice(0, 3).join(' ');
                updateSession(chatState.currentSessionId, (s) => ({
                    ...s,
                    title: `${firstThreeWords}...`,
                }));
            }

            updateSession(chatState.currentSessionId, (s) => ({
                ...s,
                messages: [...s.messages, userMessage],
                lastUpdatedAt: new Date().toISOString(),
            }));

            setIsTyping(true);

            try {
                const aiInstance = aiManager.getModel(model);
                const response = await aiInstance.executeCommand(command, {
                    message: text,
                });

                const aiResponse: Message = {
                    id: (Date.now() + 1).toString(),
                    text: response.text,
                    role: 'assistant',
                    timestamp: new Date().toLocaleTimeString(),
                };

                updateSession(chatState.currentSessionId!, (s) => ({
                    ...s,
                    messages: [...s.messages, aiResponse],
                    lastUpdatedAt: new Date().toISOString(),
                }));
            } catch (error) {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: error instanceof Error ? error.message : 'Unknown error occurred!',
                    role: 'assistant',
                    timestamp: new Date().toLocaleTimeString(),
                    isError: true,
                };

                updateSession(chatState.currentSessionId!, (s) => ({
                    ...s,
                    messages: [...s.messages, errorMessage],
                    lastUpdatedAt: new Date().toISOString(),
                }));
            } finally {
                setIsTyping(false);
            }
        },
        [chatState.currentSessionId, chatState.sessions, updateSession, aiManager]
    );

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
            const session = chatState.sessions.find((s) => s.id === sessionId);
            if (session) {
                setDeletedSessions((prev) => [...prev, session]);
                setRedoStack([]);
                dispatch({ type: 'DELETE_SESSION', sessionId });

                if (chatState.currentSessionId === sessionId) {
                    const remainingSessions = chatState.sessions.filter((s) => s.id !== sessionId);
                    if (remainingSessions.length > 0) {
                        dispatch({
                            type: 'SET_CURRENT_SESSION',
                            sessionId: remainingSessions[remainingSessions.length - 1].id,
                        });
                    } else {
                        dispatch({ type: 'SET_CURRENT_SESSION', sessionId: null });
                    }
                }
            }
        },
        [chatState.sessions, chatState.currentSessionId]
    );

    const undoDelete = useCallback(() => {
        const lastDeleted = deletedSessions[deletedSessions.length - 1];
        if (lastDeleted) {
            setDeletedSessions((prev) => prev.slice(0, -1));
            setRedoStack((prev) => [...prev, lastDeleted]);
            dispatch({ type: 'RESTORE_SESSION', session: lastDeleted });
            dispatch({ type: 'SET_CURRENT_SESSION', sessionId: lastDeleted.id });
        }
    }, [deletedSessions]);

    const redoDelete = useCallback(() => {
        const lastRestored = redoStack[redoStack.length - 1];
        if (lastRestored) {
            setRedoStack((prev) => prev.slice(0, -1));
            setDeletedSessions((prev) => [...prev, lastRestored]);
            deleteSession(lastRestored.id);
        }
    }, [redoStack, deleteSession]);

    const getGroupedSessions = useCallback(
        (searchQuery: string): GroupedSessions => {
            let filtered = chatState.sessions;
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                filtered = filtered.filter(
                    (session) =>
                        session.title.toLowerCase().includes(query) ||
                        session.messages.some((msg) => msg.text.toLowerCase().includes(query))
                );
            }

            filtered = [...filtered].sort(
                (a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
            );

            const groups = filtered.reduce((acc, session) => {
                const group = getTimeGroup(session.lastUpdatedAt);
                if (!acc[group]) {
                    acc[group] = [];
                }
                acc[group]!.push(session);
                return acc;
            }, {} as GroupedSessions);

            return groups;
        },
        [chatState.sessions]
    );

    const currentSession = chatState.currentSessionId
        ? chatState.sessions.find((s) => s.id === chatState.currentSessionId) || null
        : null;

    const handleAttachFile = useCallback((file: Omit<AttachedFile, 'id'>) => {
        const fileWithId = {
            ...file,
            id: generateUUID(),
        };
        setAttachedFiles((prev) => [...prev, fileWithId]);
    }, []);

    const handleRemoveFile = useCallback(
        (fileId: string) => {
            setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
            // If the removed file was selected, clear the selection
            if (selectedFile && selectedFile.id === fileId) {
                setSelectedFile(undefined);
            }
        },
        [selectedFile]
    );

    const value = useMemo(
        () => ({
            sessions: chatState.sessions,
            currentSession,
            currentSessionId: chatState.currentSessionId,
            isTyping,
            canUndo: deletedSessions.length > 0,
            canRedo: redoStack.length > 0,
            attachedFiles,
            selectedFile,
            selectSession,
            createNewChat,
            chatWithAI,
            renameSession,
            deleteSession,
            undoDelete,
            redoDelete,
            getGroupedSessions,
            handleAttachFile,
            handleRemoveFile,
            setSelectedFile,
        }),
        [
            chatState.sessions,
            chatState.currentSessionId,
            isTyping,
            deletedSessions,
            redoStack,
            attachedFiles,
            selectedFile,
            selectSession,
            createNewChat,
            chatWithAI,
            renameSession,
            deleteSession,
            undoDelete,
            redoDelete,
            getGroupedSessions,
            handleAttachFile,
            handleRemoveFile,
            setSelectedFile,
        ]
    );

    return (
        <ChatContext.Provider value={value}>
            <ChatNotification />
            {children}
        </ChatContext.Provider>
    );
};
