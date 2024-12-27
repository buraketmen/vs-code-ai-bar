import { ExternalLink, Minimize2Icon, TrashIcon } from 'lucide-react';
import * as React from 'react';
import { useChatContext } from '../contexts/chat-context';
import { createMessage, VSCodeMessageType } from '../events';

export const CodeSnippet: React.FC = () => {
    const { selectedFile, handleRemoveFile, setSelectedFile } = useChatContext();
    if (!selectedFile || !selectedFile.content) return null;

    const handleOpen = () => {
        if (selectedFile.path) {
            window.vscode.postMessage(
                createMessage(VSCodeMessageType.OPEN_FILE, { path: selectedFile.path })
            );
        }
    };

    return (
        <div className="relative mb-1 max-h-[240px] min-h-[40px] w-full overflow-auto rounded border border-vscode-border bg-[var(--vscode-editor-background)] p-1 font-[var(--vscode-editor-font-family)] leading-[var(--vscode-editor-line-height)] text-[var(--vscode-editor-foreground)]">
            <div className="sticky right-1 top-1 z-[1000] float-right mb-[-24px] flex gap-2">
                {selectedFile.path && (
                    <button
                        onClick={handleOpen}
                        className="hover:bg-vscode-bg-hover flex h-8 w-8 items-center justify-center rounded border border-vscode-border bg-vscode-bg p-1"
                        title="Open in Editor"
                    >
                        <ExternalLink size={14} />
                    </button>
                )}
                <button
                    onClick={() => setSelectedFile(undefined)}
                    className="hover:bg-vscode-bg-hover flex h-8 w-8 items-center justify-center rounded border border-vscode-border bg-vscode-bg p-1"
                    title="Collapse"
                >
                    <Minimize2Icon size={14} />
                </button>

                <button
                    onClick={() => handleRemoveFile(selectedFile.id)}
                    className="hover:bg-vscode-bg-hover flex h-8 w-8 items-center justify-center rounded border border-vscode-border bg-vscode-bg p-1"
                    title="Remove"
                >
                    <TrashIcon size={14} />
                </button>
            </div>
            <pre className="m-0 whitespace-pre-wrap break-words p-1 text-xs">
                {selectedFile.content}
            </pre>
        </div>
    );
};
