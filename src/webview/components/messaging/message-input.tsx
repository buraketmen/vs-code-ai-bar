import { CornerDownLeft } from 'lucide-react';
import * as React from 'react';
import { AICommand } from '../../types/ai';
import { useChatContext } from '../../contexts/chat-context';
import { useModelContext } from '../../contexts/model-context';
import { createMessage, EditorSelectionInfoResponse, VSCodeMessageType } from '../../types/events';
import ModelSelect from '../model-select';
import { AttachAssets } from './attach-assets';

const MessageInputComponent: React.FC = () => {
    const { selectedModel } = useModelContext();
    const { isTyping, chatWithAI, handleAttachFile } = useChatContext();
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const pendingPasteResolveRef = React.useRef<
        ((data: EditorSelectionInfoResponse) => void) | undefined
    >(undefined);
    const [isFocused, setIsFocused] = React.useState<boolean>(false);
    const [inputText, setInputText] = React.useState<string>('');

    // Single event listener for selection info
    React.useEffect(() => {
        const handleSelectionInfo = (event: MessageEvent) => {
            const { type, data } = event.data;
            if (
                type === VSCodeMessageType.EDITOR_SELECTION_INFO &&
                pendingPasteResolveRef.current
            ) {
                pendingPasteResolveRef.current(data);
                pendingPasteResolveRef.current = undefined;
            }
        };

        window.addEventListener('message', handleSelectionInfo);
        return () => window.removeEventListener('message', handleSelectionInfo);
    }, []);

    const getSelectionInfo = async () => {
        return new Promise<EditorSelectionInfoResponse>((resolve) => {
            pendingPasteResolveRef.current = resolve;
            window.vscode.postMessage(createMessage(VSCodeMessageType.GET_EDITOR_SELECTION_INFO));
        });
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
        const text = e.clipboardData.getData('text');
        const lines = text.split('\n');

        // If it looks like code (multiple lines or contains special characters)
        if (lines.length > 1 || /[{}[\]()=+\-*/<>]/.test(text)) {
            e.preventDefault();

            const {
                data: { fileName, fullPath, startLine, endLine },
            } = await getSelectionInfo();

            handleAttachFile({
                name: fileName || 'Code snippet',
                path: fullPath || undefined,
                type: 'snippet',
                content: text,
                startLine,
                endLine,
            });
        }
    };

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

    return (
        <div
            className={`relative flex w-full flex-col rounded-lg border border-vscode-border bg-vscode-bg-secondary p-2 transition-colors duration-150 ${
                isFocused ? 'border-vscode-border-hover' : ''
            }`}
        >
            <form onSubmit={handleSubmit}>
                <div className="flex w-full items-center justify-between gap-2 border-b border-vscode-border pb-1">
                    <AttachAssets />
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
                        className="flex shrink-0 cursor-pointer items-center justify-between gap-1 rounded-md bg-vscode-button-bg p-1 text-xs text-vscode-button-fg hover:bg-vscode-button-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Submit
                        <CornerDownLeft size={11} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export const MessageInput = React.memo(MessageInputComponent);
