import * as React from 'react';
import { useChatContext } from '../../contexts/chat-context';
import { Message } from '../../types';
import { TypingIndicator } from './typing-indicator';

interface AIMessageProps {
    message: Message;
}

export const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
    const { isTyping } = useChatContext();
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (isTyping) {
        return (
            <div className="space-y-1">
                <TypingIndicator />
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <div
                className={`w-full whitespace-pre-wrap py-2 text-vscode-fg transition-colors duration-150 ${
                    message.isError
                        ? 'rounded-md border border-rose-500 bg-rose-800 bg-opacity-10 py-0.5 text-center text-rose-500'
                        : ''
                }`}
            >
                {message.text}
            </div>
            {!message.isError && (
                <div className="flex items-center justify-end gap-2 text-xs opacity-70">
                    <button
                        onClick={handleCopy}
                        className="group flex items-center transition-opacity"
                        title={isCopied ? 'Copied!' : 'Copy to clipboard'}
                    >
                        {isCopied ? (
                            <svg
                                className="h-3.5 w-3.5 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="h-3.5 w-3.5 opacity-75 transition-opacity group-hover:opacity-100"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                />
                            </svg>
                        )}
                    </button>

                    <span className="opacity-75">{message.timestamp}</span>
                </div>
            )}
        </div>
    );
};
