import * as React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
    message: Message;
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({ message }) => {
    const isAI = message.sender === 'ai';
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // 2 saniye sonra eski haline dön
    };

    if (isAI) {
        return (
            <div className="space-y-1">
                <div className="whitespace-pre-wrap text-vscode-fg rounded-lg hover:bg-vscode-input-bg p-2 transition-colors duration-150">{message.text}</div>
                <div className="flex items-center justify-end gap-2 text-xs opacity-70">
                    <button 
                        onClick={handleCopy}
                        className="flex items-center hover:opacity-100 transition-opacity"
                        title={isCopied ? "Copied!" : "Copy to clipboard"}
                    >
                        {isCopied ? (
                            <svg className="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                        )}
                    </button>
                    <span>{message.timestamp}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="w-full rounded-lg border border-vscode-border bg-vscode-input-bg p-3 hover:bg-opacity-70 transition-colors duration-150">
                <div className="whitespace-pre-wrap text-vscode-fg">{message.text}</div>
                <div className="mt-1 text-right text-xs opacity-70">{message.timestamp}</div>
            </div>
        </div>
    );
};

export const MessageBubble = React.memo(MessageBubbleComponent);
