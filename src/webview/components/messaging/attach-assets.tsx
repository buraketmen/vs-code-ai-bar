import { X } from 'lucide-react';
import * as React from 'react';
import { useChatContext } from '../../contexts/chat-context';
import { CodeSnippet } from '../code-snippet';
import { FileSelector } from '../file-selector';

export const AttachAssets: React.FC = () => {
    const { attachedFiles, selectedFile, handleAttachFile, handleRemoveFile, setSelectedFile } =
        useChatContext();

    return (
        <div className="w-full gap-2">
            <CodeSnippet />

            <div className="flex flex-wrap items-center gap-2">
                <FileSelector buttonText="Add Context" />

                {attachedFiles.map((file) => (
                    <div
                        key={file.id}
                        className="bg-vscode-bg-tertiary group flex cursor-pointer items-center gap-1 rounded border border-vscode-border px-1 py-0.5 text-xs hover:border-vscode-border-hover"
                        onClick={() =>
                            setSelectedFile(selectedFile?.id === file.id ? undefined : file)
                        }
                        title={file.path}
                    >
                        <span>
                            {file.name}
                            {file.startLine !== undefined &&
                                file.endLine !== undefined &&
                                ` [${file.startLine}:${file.endLine}]`}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(file.id);
                            }}
                            className="hover:bg-vscode-bg-hover ml-1 rounded-full pl-1"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
