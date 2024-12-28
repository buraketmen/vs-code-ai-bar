import * as React from 'react';
import { useChatContext } from '../../contexts/chat-context';
import { VSCodeMessageType } from '../../types/events';
import { ChatGroup } from './chat-group';
import { EmptyState } from './empty-state';
import { SearchInput } from './search-input';
import { UndoRedoButtons } from './undo-redo';

export const ChatHistory: React.FC = () => {
    const { currentSessionId, selectSession, renameSession, deleteSession, getGroupedSessions } =
        useChatContext();
    const popupRef = React.useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const [editingSessionId, setEditingSessionId] = React.useState<string | null>(null);
    const [editTitle, setEditTitle] = React.useState<string>('');
    const [searchQuery, setSearchQuery] = React.useState<string>('');

    // Listen for messages from extension
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const toggleHistoryHandler = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
                case VSCodeMessageType.TOGGLE_HISTORY:
                    setIsOpen((prev) => !prev);
                    break;
            }
        };

        window.addEventListener('message', toggleHistoryHandler);
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            window.removeEventListener('message', toggleHistoryHandler);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, popupRef]);

    if (!isOpen) return null;

    const groupedSessions = getGroupedSessions(searchQuery);

    return (
        <div className="absolute inset-0 p-2">
            <div
                ref={popupRef}
                className="ml-auto w-full max-w-[500px] overflow-hidden rounded border border-vscode-border bg-vscode-bg-secondary p-2 shadow-lg"
            >
                <div className="flex items-center justify-between p-1">
                    <div className="text-sm font-medium opacity-100">Chats</div>
                    <UndoRedoButtons />
                </div>

                <div className="flex justify-center p-1">
                    <SearchInput value={searchQuery} onChange={setSearchQuery} />
                </div>

                <div className="mt-1 max-h-[250px] overflow-y-auto pt-1">
                    {Object.keys(groupedSessions).length > 0 ? (
                        Object.entries(groupedSessions).map(([group, sessions]) => (
                            <ChatGroup
                                key={group}
                                title={group}
                                sessions={sessions}
                                currentSessionId={currentSessionId}
                                editingSessionId={editingSessionId}
                                editTitle={editTitle}
                                onSelectSession={(id) => {
                                    selectSession(id);
                                    setIsOpen(false);
                                }}
                                onRenameSession={renameSession}
                                onDeleteSession={deleteSession}
                                onEditStart={(sessionId, currentTitle) => {
                                    setEditingSessionId(sessionId);
                                    setEditTitle(currentTitle);
                                }}
                                onEditEnd={() => {
                                    setEditingSessionId(null);
                                    setEditTitle('');
                                }}
                                onEditChange={setEditTitle}
                            />
                        ))
                    ) : (
                        <EmptyState searchQuery={searchQuery} />
                    )}
                </div>
            </div>
        </div>
    );
};
