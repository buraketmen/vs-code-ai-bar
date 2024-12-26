import * as React from 'react';
import { ChatSession } from '../../types';
import { ChatItem } from './chat-item';

type ChatGroupProps = {
    title: string;
    sessions: ChatSession[];
    currentSessionId: string | null;
    editingSessionId: string | null;
    editTitle: string;
    onSelectSession: (sessionId: string) => void;
    onRenameSession: (sessionId: string, newTitle: string) => void;
    onDeleteSession: (sessionId: string) => void;
    onEditStart: (sessionId: string, currentTitle: string) => void;
    onEditEnd: () => void;
    onEditChange: (value: string) => void;
};

export const ChatGroup: React.FC<ChatGroupProps> = ({
    title,
    sessions,
    currentSessionId,
    editingSessionId,
    editTitle,
    onSelectSession,
    onRenameSession,
    onDeleteSession,
    onEditStart,
    onEditEnd,
    onEditChange,
}) => (
    <div>
        <div className="mb-1 mt-2 text-[10px] font-medium opacity-50">{title}</div>
        {sessions.map((session) => (
            <ChatItem
                key={session.id}
                session={session}
                isSelected={session.id === currentSessionId}
                isEditing={session.id === editingSessionId}
                editTitle={editTitle}
                onSelect={onSelectSession}
                onRename={onRenameSession}
                onDelete={onDeleteSession}
                onEditStart={onEditStart}
                onEditEnd={onEditEnd}
                onEditChange={onEditChange}
            />
        ))}
    </div>
);
