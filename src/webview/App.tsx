import * as React from 'react';
import { useEffect } from 'react';
import { ChatHistory } from './components/chat-history';
import { MessageInput } from './components/messaging/message-input';
import { MessageList } from './components/messaging/message-list';
import { useChatContext } from './contexts/chat-context';

export const App: React.FC = () => {
    const { createNewChat } = useChatContext();

    // Listen for messages from extension
    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            const message = event.data;
            switch (message.type) {
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

    return (
        <div className="flex h-screen flex-col bg-vscode-bg">
            <div className="min-h-0 flex-1 overflow-y-auto">
                <MessageList />
            </div>
            <div className="flex-none border-t border-vscode-border p-2">
                <MessageInput />
            </div>
            <ChatHistory />
        </div>
    );
};
