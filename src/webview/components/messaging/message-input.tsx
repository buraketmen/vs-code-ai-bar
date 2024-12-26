import * as React from 'react';

interface MessageInputProps {
    inputText: string;
    isTyping: boolean;
    onInputChange: (text: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const MessageInputComponent: React.FC<MessageInputProps> = ({
    inputText,
    isTyping,
    onInputChange,
    onSubmit,
}) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '64px';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = Math.min(scrollHeight, 92) + 'px';
        }
    }, [inputText]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (!e.shiftKey) {
                e.preventDefault();
                if (!isTyping && inputText.trim()) {
                    onSubmit(e as any);
                }
            }
        }
    };

    return (
        <div className="bg-vscode-bg-secondary border-vscode-border focus-within:border-vscode-border-hover relative flex w-full flex-col rounded-lg border p-2 transition-colors duration-150">
            <form onSubmit={onSubmit}>
                <div className="h-full w-full">
                    <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="h-16 max-h-[92px] min-h-[64px] w-full resize-none border-0 bg-transparent p-0 outline-none focus:outline-none focus:ring-0"
                        disabled={isTyping}
                    />
                </div>
                <div className="border-vscode-border flex w-full items-center justify-between gap-2 border-t pt-1">
                    <div className="flex gap-1.5">{/* TODO: Add buttons */}</div>
                    <button
                        type="submit"
                        disabled={isTyping || !inputText.trim()}
                        className="bg-vscode-button-bg text-vscode-button-fg hover:bg-vscode-button-hover flex cursor-pointer items-center justify-between rounded-md p-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Submit
                        <svg
                            className="h-3 w-3"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M13 4.5V9C13 10.1046 12.1046 11 11 11H6.41421L7.70711 12.2929L7 13L4 10L7 7L7.70711 7.70711L6.41421 9H11C11.5523 9 12 8.55228 12 8V4.5H13Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export const MessageInput = React.memo(MessageInputComponent);
