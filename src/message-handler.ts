import * as vscode from 'vscode';
import {
    createMessage,
    MessageDataType,
    VSCodeMessage,
    VSCodeMessageType,
} from './webview/types/events';

export async function handleWebviewMessage(
    message: VSCodeMessage<VSCodeMessageType>,
    webviewView: vscode.WebviewView
) {
    switch (message.type) {
        case VSCodeMessageType.LOG:
            console.log(
                '[DEBUG]',
                (message.data as MessageDataType<VSCodeMessageType.LOG>).message
            );
            break;

        case VSCodeMessageType.ERROR:
            console.error(
                '[ERROR]',
                (message.data as MessageDataType<VSCodeMessageType.ERROR>).message
            );
            break;

        case VSCodeMessageType.GET_FILE_TREE:
            console.log('[DEBUG] Getting file tree');
            await handleGetFileTree(webviewView, message);
            break;

        case VSCodeMessageType.READ_FILE:
            console.log('[DEBUG] Reading file');
            await handleReadFile(webviewView, message);
            break;

        case VSCodeMessageType.OPEN_FILE:
            console.log('[DEBUG] Opening file');
            await handleOpenFile(message);
            break;

        case VSCodeMessageType.GET_WORKSPACE_PATH:
            console.log('[DEBUG] Getting workspace path');
            handleGetWorkspacePath(webviewView);
            break;

        case VSCodeMessageType.GET_EDITOR_SELECTION_INFO:
            console.log('[DEBUG] Getting editor selection info');
            handleGetEditorSelectionInfo(webviewView);
            break;

        case VSCodeMessageType.CLEAR_HISTORY:
            console.log('[DEBUG] Clearing history');
            await handleClearState(webviewView);
            break;

        case VSCodeMessageType.GET_CONFIGURATION:
            console.log('[DEBUG] Getting configuration');
            handleGetConfiguration(webviewView);
            break;
    }
}

async function handleGetFileTree(
    webviewView: vscode.WebviewView,
    message: VSCodeMessage<VSCodeMessageType>
) {
    try {
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceRoot) {
            webviewView.webview.postMessage(
                createMessage(VSCodeMessageType.FILE_TREE, {
                    tree: [],
                    error: 'No workspace folder is open. Please open a folder or workspace first.',
                })
            );
            return;
        }

        const query = (message.data as { query?: string })?.query;
        const files = await vscode.workspace.findFiles(
            query ? `**/*${query}*` : '**/*',
            '**/node_modules/**'
        );

        const tree = files.map((file) => ({
            id: Buffer.from(file.fsPath).toString('base64'),
            name: file.path.split('/').pop() || file.path,
            path: file.fsPath,
            type: 'file' as const,
        }));

        webviewView.webview.postMessage(createMessage(VSCodeMessageType.FILE_TREE, { tree }));
    } catch (error) {
        webviewView.webview.postMessage(
            createMessage(VSCodeMessageType.FILE_TREE, {
                tree: [],
                error:
                    'Error loading file tree: ' +
                    (error instanceof Error ? error.message : String(error)),
            })
        );
    }
}

async function handleReadFile(
    webviewView: vscode.WebviewView,
    message: VSCodeMessage<VSCodeMessageType>
) {
    try {
        const filePath = (message.data as { path: string }).path;
        const document = await vscode.workspace.openTextDocument(filePath);
        const content = document.getText();
        webviewView.webview.postMessage(createMessage(VSCodeMessageType.FILE_CONTENT, { content }));
    } catch (error) {
        console.error('Error reading file:', error);
        webviewView.webview.postMessage(
            createMessage(VSCodeMessageType.FILE_CONTENT, {
                content: `Error reading file: ${error instanceof Error ? error.message : String(error)}`,
                error: true,
            })
        );
    }
}

async function handleOpenFile(message: VSCodeMessage<VSCodeMessageType>) {
    try {
        const filePath = (message.data as { path: string }).path;
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document, { preview: false });
    } catch (error) {
        console.error('Error opening file:', error);
    }
}

function handleGetWorkspacePath(webviewView: vscode.WebviewView) {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        webviewView.webview.postMessage(
            createMessage(VSCodeMessageType.WORKSPACE_PATH, {
                path: vscode.workspace.workspaceFolders[0].uri.fsPath,
            })
        );
    }
}

function handleGetEditorSelectionInfo(webviewView: vscode.WebviewView) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const selection = editor.selection;
        const fullPath = editor.document.fileName;
        const fileName = fullPath.split(/[\\/]/).pop() || fullPath;

        webviewView.webview.postMessage(
            createMessage(VSCodeMessageType.EDITOR_SELECTION_INFO, {
                data: {
                    fileName,
                    fullPath,
                    startLine: selection.start.line + 1,
                    endLine: selection.end.line + 1,
                },
            })
        );
    }
}

async function handleClearState(webviewView: vscode.WebviewView) {
    try {
        // Get current configuration
        const config = vscode.workspace.getConfiguration('aiBar');
        const configuration = {
            'api.openaiApiKey': config.get('api.openaiApiKey'),
            'api.anthropicApiKey': config.get('api.anthropicApiKey'),
            'ai.temperature': config.get('ai.temperature'),
            'ai.maxTokens': config.get('ai.maxTokens'),
            'ai.maxHistoryLength': config.get('ai.maxHistoryLength'),
            'ai.maxContextMessages': config.get('ai.maxContextMessages'),
        };

        // Send clear state message to webview with preserved configuration
        webviewView.webview.postMessage(
            createMessage(VSCodeMessageType.CLEAR_HISTORY, { currentConfiguration: configuration })
        );

        // Show success message
        vscode.window.showInformationMessage(
            'Chat history has been cleared successfully. Your settings have been preserved.'
        );

        // Optionally, prompt to reload window
        const reloadSelection = await vscode.window.showInformationMessage(
            'Would you like to reload the window now?',
            'Yes',
            'No'
        );

        if (reloadSelection === 'Yes') {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    } catch (error) {
        vscode.window.showErrorMessage('Failed to clear chat history: ' + error);
    }
}

function handleGetConfiguration(webviewView: vscode.WebviewView) {
    const config = vscode.workspace.getConfiguration('aiBar');
    const configuration = {
        'api.openaiApiKey': config.get('api.openaiApiKey'),
        'api.anthropicApiKey': config.get('api.anthropicApiKey'),
        'ai.temperature': config.get('ai.temperature'),
        'ai.maxTokens': config.get('ai.maxTokens'),
        'ai.maxHistoryLength': config.get('ai.maxHistoryLength'),
        'ai.maxContextMessages': config.get('ai.maxContextMessages'),
    };

    webviewView.webview.postMessage(
        createMessage(VSCodeMessageType.CONFIGURATION_UPDATE, { configuration })
    );
}
