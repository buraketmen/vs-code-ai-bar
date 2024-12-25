import * as React from 'react';
import { Message } from '../types';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';

interface MessageListProps {
    messages: Message[];
    isTyping: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const MessageListComponent: React.FC<MessageListProps> = ({
    messages,
    isTyping,
    messagesEndRef,
}) => {
    return (
        <div className="flex-1 space-y-4 p-4">
            {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
        </div>
    );
};

export const MessageList = React.memo(MessageListComponent);
