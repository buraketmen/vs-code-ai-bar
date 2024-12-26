import * as React from 'react';
import { Message } from '../../types';

interface UserMessageProps {
    message: Message;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
    return (
        <div className="w-full">
            <div className="border-vscode-border bg-vscode-bg-secondary w-full rounded-md border bg-opacity-75 p-2 transition-colors duration-150 hover:bg-opacity-100">
                <div className="text-vscode-fg whitespace-pre-wrap">{message.text}</div>
            </div>
        </div>
    );
};
