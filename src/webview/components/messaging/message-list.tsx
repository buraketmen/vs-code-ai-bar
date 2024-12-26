import * as React from 'react';
import { Message } from '../../types';
import { AIMessage } from './ai-message';
import { EmptyMessage } from './empty-message';
import { UserMessage } from './user-message';

type MessageListProps = {
    messages: Message[];
    isTyping: boolean;
};

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

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
            <div ref={messagesEndRef} />
        </div>
    );
};
