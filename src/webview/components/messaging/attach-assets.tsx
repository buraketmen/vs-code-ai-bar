import { X } from 'lucide-react';
import * as React from 'react';
import { AttachedFile } from '../../ai/types';
import { CodeSnippet } from '../code-snippet';
import { FileSelector } from '../file-selector';

interface AttachAssetsProps {
    attachedFiles?: AttachedFile[];
    onAttachFile?: (file: AttachedFile) => void;
    onRemoveFile?: (filePath: string) => void;
}

export const AttachAssets: React.FC<AttachAssetsProps> = ({
    attachedFiles = [],
    onAttachFile,
    onRemoveFile,
}) => {
    const [selectedFile, setSelectedFile] = React.useState<AttachedFile | undefined>();

    return (
        <div className="w-full gap-2">
            <CodeSnippet
                file={selectedFile}
                onRemove={(path) => {
                    onRemoveFile?.(path);
                    setSelectedFile(undefined);
                }}
            />

            <div className="flex flex-wrap items-center gap-2">
                <FileSelector
                    onSelect={(file) => onAttachFile?.(file)}
                    attachedFiles={attachedFiles}
                    buttonText="Add Context"
                />

                {attachedFiles.map((file) => (
                    <div
                        key={file.path || file.name}
                        className="bg-vscode-bg-tertiary group flex cursor-pointer items-center gap-1 rounded border border-vscode-border p-1 text-xs hover:border-vscode-border-hover"
                        onClick={() =>
                            setSelectedFile(selectedFile?.name === file.name ? undefined : file)
                        }
                        title={file.path}
                    >
                        <span>
                            {file.name}
                            {file.startLine !== undefined &&
                                file.endLine !== undefined &&
                                `[${file.startLine}:${file.endLine}]`}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemoveFile?.(file.path || file.name);
                                if (selectedFile?.name === file.name) {
                                    setSelectedFile(undefined);
                                }
                            }}
                            className="hover:bg-vscode-bg-hover ml-1 rounded-full p-0.5"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
