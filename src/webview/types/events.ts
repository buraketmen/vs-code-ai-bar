// Event types
export enum VSCodeMessageType {
    // Log related
    LOG = 'event:log',
    ERROR = 'event:error',

    // File tree related
    GET_FILE_TREE = 'event:getFileTree',
    FILE_TREE = 'event:fileTree',

    // File operations
    READ_FILE = 'event:readFile',
    FILE_CONTENT = 'event:fileContent',
    OPEN_FILE = 'event:openFile',
    FILE_CREATED = 'event:fileCreated',
    FILE_DELETED = 'event:fileDeleted',

    // Workspace related
    GET_WORKSPACE_PATH = 'event:getWorkspacePath',
    WORKSPACE_PATH = 'event:workspacePath',

    // Editor related
    GET_EDITOR_SELECTION_INFO = 'event:getEditorSelectionInfo',
    EDITOR_SELECTION_INFO = 'event:editorSelectionInfo',

    // Chat related
    NEW_CHAT = 'event:newChat',
    TOGGLE_HISTORY = 'event:toggleHistory',
    CLEAR_STATE = 'event:clearState',
}

// Base message interface
export interface VSCodeMessage<T extends VSCodeMessageType, D = unknown> {
    type: T;
    data?: D;
}

// File related interfaces
export interface FileTreeItem {
    id: string;
    name: string;
    path: string;
    type: 'file' | 'directory';
}

export interface FileTreeRequestData {
    query?: string;
}

export interface FileTreeResponseData {
    tree: FileTreeItem[];
    error?: string;
}

export interface FileOperationData {
    path: string;
}

export interface FileContentData {
    content: string;
    error?: boolean;
}

export interface WorkspacePathData {
    path: string;
}

// Editor related interfaces
export interface EditorSelectionInfoData {
    fileName: string;
    fullPath: string;
    startLine?: number;
    endLine?: number;
}

export interface EditorSelectionInfoResponse {
    data: EditorSelectionInfoData;
}

// Log related interfaces
export interface LogMessageData {
    message: string;
}

// Message type mapping
export type VSCodeMessageMap = {
    // Log related
    [VSCodeMessageType.LOG]: LogMessageData;
    [VSCodeMessageType.ERROR]: LogMessageData;

    // File tree related
    [VSCodeMessageType.GET_FILE_TREE]: FileTreeRequestData;
    [VSCodeMessageType.FILE_TREE]: FileTreeResponseData;

    // File operations
    [VSCodeMessageType.READ_FILE]: FileOperationData;
    [VSCodeMessageType.FILE_CONTENT]: FileContentData;
    [VSCodeMessageType.OPEN_FILE]: FileOperationData;
    [VSCodeMessageType.FILE_CREATED]: FileOperationData;
    [VSCodeMessageType.FILE_DELETED]: FileOperationData;

    // Workspace related
    [VSCodeMessageType.GET_WORKSPACE_PATH]: undefined;
    [VSCodeMessageType.WORKSPACE_PATH]: WorkspacePathData;

    // Editor related
    [VSCodeMessageType.GET_EDITOR_SELECTION_INFO]: undefined;
    [VSCodeMessageType.EDITOR_SELECTION_INFO]: EditorSelectionInfoResponse;

    // Chat related
    [VSCodeMessageType.NEW_CHAT]: undefined;
    [VSCodeMessageType.TOGGLE_HISTORY]: undefined;
    [VSCodeMessageType.CLEAR_STATE]: undefined;
};

// Helper type to get the data type for a specific message type
export type MessageDataType<T extends VSCodeMessageType> = VSCodeMessageMap[T];

// Helper function to create typed messages
export function createMessage<T extends VSCodeMessageType>(
    type: T,
    data?: VSCodeMessageMap[T]
): VSCodeMessage<T, VSCodeMessageMap[T]> {
    return { type, data } as VSCodeMessage<T, VSCodeMessageMap[T]>;
}
