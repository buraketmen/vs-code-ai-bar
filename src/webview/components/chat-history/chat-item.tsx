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
                        className="bg-vscode-input-bg text-vscode-input-foreground border-vscode-border hover:border-vscode-border-hover focus:border-vscode-border-hover active:border-vscode-border-hover w-full rounded border p-1 text-xs"
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
                            className="text-vscode-fg hover:bg-vscode-list-hover flex-none rounded p-0.5 transition-colors"
                            title="Rename"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
                            </svg>
                        </button>
                        {!isSelected && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(session.id);
                                }}
                                className="text-vscode-fg hover:bg-vscode-list-hover flex-none rounded p-0.5 transition-colors"
                                title="Delete"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
);
