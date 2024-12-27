import { ExternalLink, X } from 'lucide-react';
import * as React from 'react';
import { useChatContext } from '../contexts/chat-context';

export const CodeSnippet: React.FC = () => {
    const { selectedFile, handleRemoveFile } = useChatContext();
    if (!selectedFile || !selectedFile.content) return null;

    const handleOpen = () => {
        if (selectedFile.path) {
            window.vscode.postMessage({
                type: 'openFile',
                data: { path: selectedFile.path },
            });
        }
    };

    return (
        <div className="relative mb-1 max-h-[240px] min-h-[40px] w-full overflow-auto rounded border border-vscode-border bg-[var(--vscode-editor-background)] p-1 font-[var(--vscode-editor-font-family)] leading-[var(--vscode-editor-line-height)] text-[var(--vscode-editor-foreground)]">
            <div className="sticky right-1 top-1 z-[1000] float-right mb-[-24px] flex gap-1">
                {selectedFile.path && (
                    <button
                        onClick={handleOpen}
                        className="hover:bg-vscode-bg-hover flex h-5 w-5 items-center justify-center rounded border border-vscode-border bg-vscode-bg-secondary opacity-80 hover:opacity-100"
                        title="Open in Editor"
                    >
                        <ExternalLink size={14} />
                    </button>
                )}
                <button
                    onClick={() => handleRemoveFile(selectedFile.id)}
                    className="hover:bg-vscode-bg-hover flex h-5 w-5 items-center justify-center rounded border border-vscode-border bg-vscode-bg-secondary opacity-80 hover:opacity-100"
                    title="Remove"
                >
                    <X size={14} />
                </button>
            </div>
            <pre className="m-0 whitespace-pre-wrap break-words text-xs">
                {selectedFile.content}
            </pre>
        </div>
    );
};
