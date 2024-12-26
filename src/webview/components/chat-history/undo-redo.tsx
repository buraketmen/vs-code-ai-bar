import * as React from 'react';
import { useChatContext } from '../../contexts/chat-context';

export const UndoRedoButtons: React.FC = () => {
    const { canUndo, canRedo, undoDelete, redoDelete } = useChatContext();

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={undoDelete}
                disabled={!canUndo}
                className="text-vscode-fg hover:bg-vscode-list-hover flex-none cursor-pointer rounded p-0.5 transition-colors disabled:opacity-40"
                title="Undo delete (Cmd+Z)"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 7v6h6" />
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                </svg>
            </button>
            <button
                onClick={redoDelete}
                disabled={!canRedo}
                className="text-vscode-fg hover:bg-vscode-list-hover flex-none cursor-pointer rounded p-0.5 transition-colors disabled:opacity-40"
                title="Redo delete (Cmd+Shift+Z)"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M21 7v6h-6" />
                    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
                </svg>
            </button>
        </div>
    );
};
