import { Edit, Trash } from 'lucide-react';
import * as React from 'react';
import { ChatSession } from '../../types';

type ChatItemProps = {
    session: ChatSession;
    isSelected: boolean;
    isEditing: boolean;
    editTitle: string;
    onSelect: (sessionId: string) => void;
    onRename: (sessionId: string, newTitle: string) => void;
    onDelete: (sessionId: string) => void;
    onEditStart: (sessionId: string, currentTitle: string) => void;
    onEditEnd: () => void;
    onEditChange: (value: string) => void;
};

export const ChatItem: React.FC<ChatItemProps> = ({
    session,
    isSelected,
    isEditing,
    editTitle,
    onSelect,
    onRename,
    onDelete,
    onEditStart,
    onEditEnd,
    onEditChange,
}) => (
    <div
        className={`group relative mb-0.5 flex cursor-pointer items-center rounded px-2 py-1 text-xs transition-colors ${
            isSelected
                ? 'bg-[var(--vscode-editor-selectionBackground)] text-[var(--vscode-editor-selectionForeground)]'
                : 'hover:bg-[var(--vscode-list-hoverBackground)]'
        }`}
        onClick={() => onSelect(session.id)}
    >
        <div className={`flex min-w-0 flex-1 items-center ${isEditing ? '' : 'justify-between'}`}>
            {isEditing ? (
                <div
                    className="flex min-w-0 flex-1 items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => onEditChange(e.target.value)}
                        onBlur={() => {
                            if (editTitle.trim()) {
                                onRename(session.id, editTitle.trim());
                            }
                            onEditEnd();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (editTitle.trim()) {
                                    onRename(session.id, editTitle.trim());
                                }
                                onEditEnd();
                            }
                        }}
                        className="text-vscode-input-foreground w-full rounded border border-vscode-border bg-vscode-input-bg p-1 text-xs hover:border-vscode-border-hover focus:border-vscode-border-hover active:border-vscode-border-hover"
                        autoFocus
                    />
                </div>
            ) : (
                <div className="flex min-w-0 flex-1 items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="truncate">{session.title}</div>
                    </div>
                    <div className="ml-2 flex flex-none items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditStart(session.id, session.title);
                            }}
                            className="flex-none rounded p-0.5 text-vscode-fg opacity-75 transition-colors hover:bg-vscode-list-hover hover:opacity-100"
                            title="Rename"
                        >
                            <Edit size={14} />
                        </button>

                        {!isSelected && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(session.id);
                                }}
                                className="flex-none rounded p-0.5 text-vscode-fg opacity-75 transition-colors hover:bg-vscode-list-hover hover:opacity-100"
                                title="Delete"
                            >
                                <Trash size={14} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
);
