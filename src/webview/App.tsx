import * as React from 'react';
import { ChatHistory } from './components/chat-history';
import { MessageInput } from './components/messaging/message-input';
import { MessageList } from './components/messaging/message-list';

export const App: React.FC = () => {
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
