import * as React from 'react';
import { AICommand, AttachedFile } from '../../ai/types';
import { useChatContext } from '../../contexts/chat-context';
import { useModelContext } from '../../contexts/model-context';
import ModelSelect from '../model-select';
import { AttachAssets } from './attach-assets';

const MessageInputComponent: React.FC = () => {
    const { selectedModel } = useModelContext();
    const { isTyping, chatWithAI } = useChatContext();
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = React.useState<boolean>(false);
    const [inputText, setInputText] = React.useState<string>('');
    const [attachedFiles, setAttachedFiles] = React.useState<AttachedFile[]>([]);

    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '64px';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = Math.min(scrollHeight, 92) + 'px';
        }
    }, [inputText]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim() && !isTyping) {
            chatWithAI(inputText, selectedModel, AICommand.CHAT);
            setInputText('');
        }
    };

    const handleAttachFile = (file: AttachedFile) => {
        setAttachedFiles((prev) => [...prev, file]);
    };

    const handleRemoveFile = (filePath: string) => {
        setAttachedFiles((prev) => prev.filter((file) => (file.path || file.name) !== filePath));
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const text = e.clipboardData.getData('text');
        const lines = text.split('\n');

        // If it looks like code (multiple lines or contains special characters)
        if (lines.length > 1 || /[{}[\]()=+\-*/<>]/.test(text)) {
            e.preventDefault();

            // Add as a snippet
            handleAttachFile({
                name: 'Pasted Code',
                type: 'snippet',
                content: text,
            });
        }
    };

    return (
        <div
            className={`relative flex w-full flex-col rounded-lg border border-vscode-border bg-vscode-bg-secondary p-2 transition-colors duration-150 ${
                isFocused ? 'border-vscode-border-hover' : ''
            }`}
        >
            <form onSubmit={handleSubmit}>
                <div className="flex w-full items-center justify-between gap-2 border-b border-vscode-border pb-1">
                    <AttachAssets
                        attachedFiles={attachedFiles}
                        onAttachFile={handleAttachFile}
                        onRemoveFile={handleRemoveFile}
                    />
                </div>
                <div className="h-full w-full">
                    <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        onPaste={handlePaste}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Type your message..."
                        className="h-16 max-h-[92px] min-h-[64px] w-full resize-none border-0 bg-transparent p-0 outline-none focus:outline-none focus:ring-0"
                        disabled={isTyping}
                    />
                </div>
                <div className="flex w-full items-center justify-between gap-2 border-t border-vscode-border pt-1">
                    <div className="flex min-w-0 gap-1.5">
                        <ModelSelect />
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
