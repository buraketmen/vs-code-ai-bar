import { ExternalLink, X } from 'lucide-react';
import * as React from 'react';
import { AttachedFile } from '../../ai/types';

interface CodeSnippetProps {
    file?: AttachedFile;
    onRemove?: (filePath: string) => void;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ file, onRemove }) => {
    if (!file) return null;

    const handleOpen = () => {
        window.vscode.postMessage({
            type: 'openFile',
            data: { path: file.path || file.name },
        });
    };

    return (
        <div className="relative mb-1 max-h-[240px] min-h-[40px] w-full overflow-auto rounded border border-vscode-border bg-vscode-bg p-1 font-[var(--vscode-editor-font-family)] leading-[var(--vscode-editor-line-height)] text-[var(--vscode-editor-foreground)]">
            <div className="sticky right-1 top-1 z-[1000] float-right mb-[-24px] flex gap-1">
                <button
                    onClick={handleOpen}
                    className="hover:bg-vscode-bg-hover flex h-5 w-5 items-center justify-center rounded border border-vscode-border bg-vscode-bg-secondary opacity-80 hover:opacity-100"
                    title="Open in Editor"
                >
                    <ExternalLink size={14} />
                </button>
                <button
                    onClick={() => onRemove?.(file.path || file.name)}
                    className="hover:bg-vscode-bg-hover flex h-5 w-5 items-center justify-center rounded border border-vscode-border bg-vscode-bg-secondary opacity-80 hover:opacity-100"
                    title="Remove"
                >
                    <X size={14} />
                </button>
            </div>
            <div className="flex whitespace-pre">
                <div
                    className="user-select-none border-r border-vscode-border bg-vscode-bg px-1 text-right text-[var(--vscode-editorLineNumber-foreground)]"
                    aria-hidden="true"
                    role="presentation"
                >
                    {file.content.split('\n').map((_, i) => (
                        <div key={i} className="p-0.5 opacity-40">
                            {i + 1}
                        </div>
                    ))}
                </div>
                <div className="flex flex-1 whitespace-pre px-0.5">
                    <div className="view-lines">
                        {file.content.split('\n').map((line, i) => (
                            <div key={i} className="relative">
                                <span className="font-[var(--vscode-editor-font-family)]">
                                    {line || '\n'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
