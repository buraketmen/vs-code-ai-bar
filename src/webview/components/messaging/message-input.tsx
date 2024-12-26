import * as React from 'react';
import { AIModel, AI_MODELS } from '../../types';

interface MessageInputProps {
    inputText: string;
    isTyping: boolean;
    onInputChange: (text: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    selectedModel: AIModel;
    onModelChange: (model: AIModel) => void;
}

const MessageInputComponent: React.FC<MessageInputProps> = ({
    inputText,
    isTyping,
    onInputChange,
    onSubmit,
    selectedModel,
    onModelChange,
}) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);

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

    const handleModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onModelChange(e.target.value as AIModel);
    };

    return (
        <div
            className={`relative flex w-full flex-col rounded-lg border border-vscode-border bg-vscode-bg-secondary p-2 transition-colors duration-150 ${
                isFocused ? 'border-vscode-border-hover' : ''
            }`}
        >
            <form onSubmit={onSubmit}>
                <div className="h-full w-full">
                    <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Type your message..."
                        className="h-16 max-h-[92px] min-h-[64px] w-full resize-none border-0 bg-transparent p-0 outline-none focus:outline-none focus:ring-0"
                        disabled={isTyping}
                    />
                </div>
                <div className="flex w-full items-center justify-between gap-2 border-t border-vscode-border pt-1">
                    <div className="flex min-w-0 gap-1.5">
                        <select
                            value={selectedModel}
                            onChange={handleModelSelect}
                            className="w-full min-w-[64px] max-w-[112px] truncate rounded-sm border-none bg-vscode-bg-secondary py-1 text-xs opacity-50 outline-none hover:opacity-100 focus:outline-none focus:ring-0 focus-visible:outline-none [&_optgroup]:!font-semibold [&_option]:pl-0 [&_option]:!font-normal"
                        >
                            <optgroup label="ChatGPT">
                                {AI_MODELS.chatgpt.map((model) => (
                                    <option key={model} value={model} className="truncate">
                                        {model}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Claude">
                                {AI_MODELS.claude.map((model) => (
                                    <option key={model} value={model} className="truncate">
                                        {model}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isTyping || !inputText.trim()}
                        className="flex shrink-0 cursor-pointer items-center justify-between rounded-md bg-vscode-button-bg p-1 text-xs text-vscode-button-fg hover:bg-vscode-button-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Submit
                        <svg
                            className="ml-1 h-3 w-3"
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
