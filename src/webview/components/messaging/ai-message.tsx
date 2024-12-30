import { CheckIcon, CopyIcon } from 'lucide-react';
import * as React from 'react';
import { Message } from '../../types/chat';

interface AIMessageProps {
    message: Message;
}

export const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
    const [isCopied, setIsCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

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
                            <CheckIcon size={12} className="text-green-500" />
                        ) : (
                            <CopyIcon
                                size={12}
                                className="opacity-75 transition-opacity group-hover:opacity-100"
                            />
                        )}
                    </button>

                    <span className="opacity-75">{message.timestamp}</span>
                </div>
            )}
        </div>
    );
};
