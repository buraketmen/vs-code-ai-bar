import * as React from 'react';
import { useChatContext } from '../../contexts/chat-context';
import { AIMessage } from './ai-message';
import { EmptyMessage } from './empty-message';
import { TypingIndicator } from './typing-indicator';
import { UserMessage } from './user-message';

export const MessageList: React.FC = () => {
    const { isTyping, currentSession } = useChatContext();
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const messages = currentSession?.messages || [];

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return <EmptyMessage />;
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            {messages.map((message, index) =>
                message.role === 'user' ? (
                    <UserMessage key={index} message={message} />
                ) : (
                    <AIMessage key={index} message={message} />
                )
            )}
            {isTyping && (
                <div className="space-y-1">
                    <TypingIndicator />
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};
