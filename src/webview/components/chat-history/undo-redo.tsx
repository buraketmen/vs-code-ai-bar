import { RedoIcon, UndoIcon } from 'lucide-react';
import * as React from 'react';
import { useChatContext } from '../../contexts/chat-context';

export const UndoRedoButtons: React.FC = () => {
    const { canUndo, canRedo, undoDelete, redoDelete } = useChatContext();

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={undoDelete}
                disabled={!canUndo}
                className="flex-none cursor-pointer rounded p-0.5 text-vscode-fg transition-colors hover:bg-vscode-list-hover disabled:opacity-40"
                title="Undo delete (Cmd+Z)"
            >
                <UndoIcon size={16} />
            </button>
            <button
                onClick={redoDelete}
                disabled={!canRedo}
                className="flex-none cursor-pointer rounded p-0.5 text-vscode-fg transition-colors hover:bg-vscode-list-hover disabled:opacity-40"
                title="Redo delete (Cmd+Shift+Z)"
            >
                <RedoIcon size={16} />
            </button>
        </div>
    );
};
