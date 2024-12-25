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
    onSubmit
}) => {
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
        <form onSubmit={onSubmit}>
            <div className="flex gap-2 flex-nowrap">
                <textarea
                    value={inputText}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="h-[92px] p-2 bg-vscode-input-bg border-vscode-border text-vscode-fg focus:border-vscode-button-bg w-full flex-1 resize-none rounded-lg border focus:outline-none"
                    disabled={isTyping}
                />
                
                <button
                    type="submit"
                    disabled={isTyping || !inputText.trim()}
                    className="px-4 py-2 bg-vscode-button-bg text-vscode-button-fg rounded-lg hover:bg-vscode-button-hover disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </form>
    );
};

export const MessageInput = React.memo(MessageInputComponent); 