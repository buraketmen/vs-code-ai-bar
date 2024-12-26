import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatHistory } from './components/chat-history';
import { MessageInput } from './components/messaging/message-input';
import { MessageList } from './components/messaging/message-list';
import { useChatContext } from './contexts/chat-context';

export const App: React.FC = () => {
    const { currentSession, isTyping, sendMessage, createNewChat } = useChatContext();

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const handleCloseHistory = useCallback(() => {
        setIsHistoryOpen(false);
    }, []);

    const handleInputChange = useCallback((text: string) => {
        setInputText(text);
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!inputText.trim()) return;

            sendMessage(inputText);
            setInputText('');
        },
        [inputText, sendMessage]
    );

    // Listen for messages from extension
    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
                case 'toggleHistory':
                    setIsHistoryOpen((prev) => !prev);
                    break;
                case 'newChat':
                    createNewChat();
                    break;
            }
        };

        window.addEventListener('message', messageHandler);

        // Send ready message to extension
        window.vscode.postMessage({ type: 'ready' });

        return () => window.removeEventListener('message', messageHandler);
    }, [createNewChat]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [currentSession?.messages, scrollToBottom]);

    return (
        <div className="bg-vscode-bg flex h-screen">
            <div className="flex flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <MessageList
                        messages={currentSession?.messages || []}
                        isTyping={isTyping}
                        messagesEndRef={messagesEndRef}
                    />
                </div>
                <div className="border-vscode-border flex-none border-t p-2">
                    <MessageInput
                        inputText={inputText}
                        isTyping={isTyping}
                        onInputChange={handleInputChange}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
            <ChatHistory
                isOpen={isHistoryOpen}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClose={handleCloseHistory}
                popupRef={popupRef}
            />
        </div>
    );
};
