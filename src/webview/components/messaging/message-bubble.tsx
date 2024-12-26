import * as React from 'react';
import { Message } from '../../types';
import { AIMessage } from './ai-message';
import { UserMessage } from './user-message';

interface MessageBubbleProps {
    message: Message;
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({ message }) => {
    return message.sender === 'ai' ? (
        <AIMessage message={message} />
    ) : (
        <UserMessage message={message} />
    );
};

export const MessageBubble = React.memo(MessageBubbleComponent);
