import {
    AlertCircle,
    File,
    FileCheck,
    FileCode,
    FileJson,
    FileText,
    Info,
    Loader,
    Plus,
    Search,
} from 'lucide-react';
import * as React from 'react';
import { useChatContext } from '../contexts/chat-context';
import {
    createMessage,
    FileContentData,
    FileTreeResponseData,
    VSCodeMessageType,
    WorkspacePathData,
} from '../events';

interface FileSelectorProps {
    className?: string;
    buttonText?: string;
}

interface FileTreeItem {
    id: string;
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileTreeItem[];
}

export const FileSelector: React.FC<FileSelectorProps> = ({
    className,
    buttonText = 'Add Context',
}) => {
    const { attachedFiles, handleAttachFile } = useChatContext();
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [fileTree, setFileTree] = React.useState<FileTreeItem[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [activeFileReadPath, setActiveFileReadPath] = React.useState<string | null>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const searchRef = React.useRef<HTMLInputElement>(null);
    const [workspacePath, setWorkspacePath] = React.useState<string>('');

    React.useEffect(() => {
        loadFileTree();
    }, []);

    React.useEffect(() => {
        if (isOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [isOpen]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        // Get workspace path when component mounts
        window.vscode.postMessage(createMessage(VSCodeMessageType.GET_WORKSPACE_PATH));
        const handleMessage = (event: MessageEvent) => {
            const { type, data } = event.data;
            if (type === VSCodeMessageType.WORKSPACE_PATH) {
                const { path } = data as WorkspacePathData;
                setWorkspacePath(path);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const { type } = event.data;
            if (
                type === VSCodeMessageType.FILE_CREATED ||
                type === VSCodeMessageType.FILE_DELETED
            ) {
                loadFileTree();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Single event handler for all file tree related messages
    React.useEffect(() => {
        const handleFileTreeMessage = (event: MessageEvent) => {
            const { type, data } = event.data;
            if (type === VSCodeMessageType.FILE_TREE) {
                const { tree, error: responseError } = data as FileTreeResponseData;
                if (responseError) {
                    setError(responseError);
                } else {
                    setFileTree(tree);
                }
            }
        };

        window.addEventListener('message', handleFileTreeMessage);
        return () => window.removeEventListener('message', handleFileTreeMessage);
    }, []);

    // Single event handler for file content messages
    React.useEffect(() => {
        const handleFileContentMessage = (event: MessageEvent) => {
            const { type, data } = event.data;
            if (type === VSCodeMessageType.FILE_CONTENT && activeFileReadPath) {
                const { content, error } = data as FileContentData;
                if (error) {
                    setError(content);
                    setActiveFileReadPath(null);
                    return;
                }

                // Find the file that was being read
                const pendingFile = fileTree.find((file) => file.path === activeFileReadPath);
                if (pendingFile) {
                    handleAttachFile({
                        name: pendingFile.name,
                        path: pendingFile.path,
                        type: 'file',
                        content,
                    });
                    setIsOpen(false);
                    setSearchQuery('');
                    setActiveFileReadPath(null);
                }
            }
        };

        window.addEventListener('message', handleFileContentMessage);
        return () => window.removeEventListener('message', handleFileContentMessage);
    }, [fileTree, handleAttachFile, activeFileReadPath]);

    const loadFileTree = async () => {
        setLoading(true);
        setError(null);
        try {
            window.vscode.postMessage(
                createMessage(VSCodeMessageType.GET_FILE_TREE, { query: searchQuery })
            );
        } catch (error) {
            setError('Error loading file tree');
            console.error('Error loading file tree:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadFileTree();
    }, [searchQuery]);

    const handleFileSelect = async (item: FileTreeItem) => {
        if (attachedFiles.some((file) => file.path === item.path)) {
            return;
        }

        try {
            setActiveFileReadPath(item.path);
            window.vscode.postMessage(
                createMessage(VSCodeMessageType.READ_FILE, { path: item.path })
            );
        } catch (error) {
            console.error('Error reading file:', error);
            setActiveFileReadPath(null);
        }
    };

    const isTextFile = (filename: string): boolean => {
        const textExtensions = [
            '.txt',
            '.md',
            '.json',
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.html',
            '.css',
            '.scss',
            '.less',
            '.xml',
            '.yaml',
            '.yml',
            '.sh',
            '.bash',
            '.zsh',
            '.fish',
            '.ps1',
            '.py',
            '.rb',
            '.php',
            '.java',
            '.c',
            '.cpp',
            '.h',
            '.hpp',
            '.cs',
            '.go',
            '.rs',
            '.swift',
            '.kt',
            '.kts',
            '.sql',
            '.graphql',
            '.prisma',
            '.vue',
            '.svelte',
            '.astro',
            '.env',
            '.ini',
            '.conf',
            '.config',
            '.gitignore',
            '.npmrc',
            '.eslintrc',
            '.prettierrc',
            '.lock',
            '.toml',
            '.cfg',
        ];

        const ext = filename.toLowerCase().split('.').pop();
        if (!ext) return false;
        return textExtensions.some(
            (textExt) =>
                textExt === `.${ext}` ||
                (textExt === filename.toLowerCase() && !filename.includes('.'))
        );
    };

    const filteredFiles = React.useMemo(() => {
        const textFiles = fileTree.filter((file) => isTextFile(file.name));
        if (!searchQuery) return textFiles;
        return textFiles.filter((file) =>
            file.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [fileTree, searchQuery]);

    const getFileIcon = (filename: string) => {
        const ext = filename.toLowerCase().split('.').pop();
        const iconProps = { size: 14, className: 'shrink-0' };

        switch (ext) {
            case 'js':
            case 'jsx':
            case 'ts':
            case 'tsx':
            case 'py':
            case 'rb':
            case 'php':
            case 'java':
            case 'cs':
            case 'go':
            case 'rs':
            case 'swift':
            case 'kt':
                return <FileCode {...iconProps} />;
            case 'json':
                return <FileJson {...iconProps} />;
            case 'md':
            case 'txt':
                return <FileText {...iconProps} />;
            case 'yml':
            case 'yaml':
            case 'xml':
            case 'html':
            case 'css':
            case 'scss':
            case 'less':
                return <FileCheck {...iconProps} />;
            default:
                return <File {...iconProps} />;
        }
    };

    const getRelativePath = (fullPath: string): string => {
        if (!workspacePath || !fullPath.startsWith(workspacePath)) {
            return fullPath;
        }
        // Get path relative to workspace root
        const relativePath = fullPath.slice(workspacePath.length);
        // Convert backslashes to forward slashes and remove leading/trailing slashes
        return relativePath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className={`inline-flex h-6 items-center gap-1 rounded bg-vscode-bg-secondary px-2 text-xs hover:bg-vscode-button-hover hover:text-vscode-button-fg focus:outline-none focus:ring-1 focus:ring-vscode-border disabled:cursor-not-allowed disabled:opacity-50 ${className} opacity-50 hover:opacity-100 focus:opacity-100`}
            >
                <Plus size={14} />
                {attachedFiles.length == 0 && <span>{buttonText}</span>}
            </button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    style={{
                        left: 0,
                        width: 'calc(100vw - 2rem)',
                        maxWidth: '400px',
                        maxHeight: '300px',
                        minHeight: '120px',
                        overflowY: 'auto',
                    }}
                    className="absolute bottom-full mb-1 rounded-lg border border-vscode-border bg-vscode-bg shadow-lg"
                >
                    <div className="border-b border-vscode-border p-1">
                        <div className="flex items-center gap-1 rounded border border-vscode-border bg-vscode-input-bg px-1 py-0.5">
                            <Search size={12} className="opacity-50" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        setIsOpen(false);
                                    }
                                }}
                                placeholder="Search files..."
                                className="w-full bg-transparent text-xs focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1">
                        {loading ? (
                            <div className="flex items-center gap-2 px-2 py-1 text-xs">
                                <Loader size={12} className="animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="text-vscode-error flex items-center gap-2 px-2 py-1 text-xs">
                                <AlertCircle size={12} />
                                {error}
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="text-vscode-foreground-secondary flex items-center gap-2 px-2 py-1 text-xs">
                                <Info size={12} />
                                {searchQuery ? 'No matching files' : 'No files available'}
                            </div>
                        ) : (
                            filteredFiles.map((item) => (
                                <div
                                    key={item.path}
                                    className="hover:bg-vscode-bg-hover group flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs"
                                    onClick={() => handleFileSelect(item)}
                                    title={item.path}
                                >
                                    {getFileIcon(item.name)}
                                    <div className="flex min-w-0 flex-1 gap-0.5">
                                        <span className="basis-1/2 truncate font-medium">
                                            {item.name}
                                        </span>
                                        <span className="rtl basis-1/2 truncate text-right opacity-40 group-hover:opacity-100">
                                            {getRelativePath(item.path)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
