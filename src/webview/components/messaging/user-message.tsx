import * as React from 'react';
import { Message } from '../../types/chat';

interface UserMessageProps {
    message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
    return (
        <div className="w-full">
            <div className="w-full rounded-md border border-vscode-border bg-vscode-bg-secondary bg-opacity-75 p-2 transition-colors duration-150 hover:bg-opacity-100">
                <div className="whitespace-pre-wrap text-vscode-fg">{message.text}</div>
            </div>
        </div>
    );
};
