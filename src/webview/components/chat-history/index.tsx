import * as React from 'react';
import { useChatContext } from '../../contexts/chat-context';
import { TIME_GROUP_ORDER, TimeGroup } from '../../utils/time';
import { ChatGroup } from './chat-group';
import { EmptyState } from './empty-state';
import { SearchInput } from './search-input';
import { UndoRedoButtons } from './undo-redo';

type ChatHistoryProps = {
    isOpen: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onClose: () => void;
    popupRef: React.RefObject<HTMLDivElement | null>;
};

export const ChatHistory: React.FC<ChatHistoryProps> = ({
    isOpen,
    searchQuery,
    onSearchChange,
    onClose,
    popupRef,
}) => {
    const { currentSessionId, selectSession, renameSession, deleteSession, getGroupedSessions } =
        useChatContext();

    const [editingSessionId, setEditingSessionId] = React.useState<string | null>(null);
    const [editTitle, setEditTitle] = React.useState('');

    // Handle click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, popupRef]);

    if (!isOpen) return null;

    const groupedSessions = getGroupedSessions(searchQuery);

    return (
        <div className="absolute inset-0 p-2">
            <div
                ref={popupRef}
                className="border-vscode-border bg-vscode-bg-secondary ml-auto w-full max-w-[500px] overflow-hidden rounded border p-2 shadow-lg"
            >
                <div className="flex items-center justify-between p-1">
                    <div className="text-sm font-medium opacity-100">Chats</div>
                    <UndoRedoButtons />
                </div>

                <div className="flex justify-center p-1">
                    <SearchInput value={searchQuery} onChange={onSearchChange} />
                </div>

                <div className="mt-1 max-h-[250px] overflow-y-auto pt-1">
                    {Object.keys(groupedSessions).length > 0 ? (
                        Object.entries(groupedSessions)
                            .sort(
                                ([groupA], [groupB]) =>
                                    TIME_GROUP_ORDER[groupA as TimeGroup] -
                                    TIME_GROUP_ORDER[groupB as TimeGroup]
                            )
                            .map(([group, sessions]) => (
                                <ChatGroup
                                    key={group}
                                    title={group}
                                    sessions={sessions}
                                    currentSessionId={currentSessionId}
                                    editingSessionId={editingSessionId}
                                    editTitle={editTitle}
                                    onSelectSession={(id) => {
                                        selectSession(id);
                                        onClose();
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
