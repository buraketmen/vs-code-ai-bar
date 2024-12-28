// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {
    createMessage,
    MessageDataType,
    VSCodeMessage,
    VSCodeMessageType,
} from './webview/types/events';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Create output channel
    const outputChannel = vscode.window.createOutputChannel('AI Assistant');
    outputChannel.show();
    outputChannel.appendLine('AI Assistant extension is now active!');

    let currentPanel: vscode.WebviewView | undefined = undefined;

    // Register WebviewViewProvider
    const provider = new AIAssistantViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('ai-bar-view', provider, {
            webviewOptions: {
                retainContextWhenHidden: true,
            },
        })
    );

    // Watch for file system changes
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*');

    fileSystemWatcher.onDidCreate((uri) => {
        if (provider.currentView) {
            provider.currentView.webview.postMessage(
                createMessage(VSCodeMessageType.FILE_CREATED, { path: uri.fsPath })
            );
        }
    });

    fileSystemWatcher.onDidDelete((uri) => {
        if (provider.currentView) {
            provider.currentView.webview.postMessage(
                createMessage(VSCodeMessageType.FILE_DELETED, { path: uri.fsPath })
            );
        }
    });

    context.subscriptions.push(fileSystemWatcher);

    // Register focus command
    let focusDisposable = vscode.commands.registerCommand('ai-bar.focus', async () => {
        const view = await vscode.commands.executeCommand('ai-bar-view.focus');
        return view;
    });

    // Register new chat command
    let newChatDisposable = vscode.commands.registerCommand('ai-bar.newChat', () => {
        if (provider.currentView) {
            provider.currentView.webview.postMessage(createMessage(VSCodeMessageType.NEW_CHAT));
        }
    });

    // Register history toggle command
    let toggleHistoryDisposable = vscode.commands.registerCommand('ai-bar.toggleHistory', () => {
        if (provider.currentView) {
            provider.currentView.webview.postMessage(
                createMessage(VSCodeMessageType.TOGGLE_HISTORY)
            );
        }
    });

    // Register open command
    let openDisposable = vscode.commands.registerCommand('ai-bar.open', async () => {
        try {
            // First, show the view container
            await vscode.commands.executeCommand('workbench.view.extension.ai-bar');
            // Then focus the view
            await vscode.commands.executeCommand('ai-bar-view.focus');
            // Finally, focus the webview
            if (provider.currentView) {
                provider.currentView.show(true);
            }
        } catch (error) {
            console.error('Error opening AI Bar:', error);
        }
    });

    // Register clear state command
    let clearStateDisposable = vscode.commands.registerCommand('ai-bar.clearState', async () => {
        const view = provider.currentView;
        if (!view) {
            // If view is not available, try to focus it first
            await vscode.commands.executeCommand('ai-bar-view.focus');
            return;
        }

        // Ask for confirmation
        const selection = await vscode.window.showWarningMessage(
            'Are you sure you want to clear all chat history? Your settings and API keys will be preserved.',
            'Yes',
            'No'
        );

        if (selection === 'Yes') {
            view.webview.postMessage(createMessage(VSCodeMessageType.CLEAR_STATE));
        }
    });

    context.subscriptions.push(
        vscode.commands.registerCommand('ai-bar.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', '@ext:ai-bar.ai-bar');
        })
    );

    context.subscriptions.push(
        focusDisposable,
        toggleHistoryDisposable,
        newChatDisposable,
        openDisposable,
        clearStateDisposable
    );
}

class AIAssistantViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public get currentView(): vscode.WebviewView | undefined {
        return this._view;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'dist')],
        };

        // Set title
        webviewView.title = 'Chat';
        webviewView.description = '';

        const scriptUri = webviewView.webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js')
        );

        webviewView.webview.html = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webviewView.webview.cspSource}; script-src 'unsafe-eval' ${webviewView.webview.cspSource}; connect-src ${webviewView.webview.cspSource}; img-src ${webviewView.webview.cspSource} https:">
                <title>AI Assistant</title>
                <style>
                    html, body {
                        height: 100vh;
                        padding: 0;
                        margin: 0;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                    #root {
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                    }
                    .loading {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        font-size: 1.2em;
                        flex-direction: column;
                        gap: 1rem;
                    }
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 3px solid var(--vscode-editor-foreground);
                        border-radius: 50%;
                        border-top-color: transparent;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        to {
                            transform: rotate(360deg);
                        }
                    }
                </style>
            </head>
            <body>
                <div id="root">
                    <div class="loading">
                        <div class="spinner"></div>
                        <div>Loading...</div>
                    </div>
                </div>
                <script>
                    window.process = {
                        env: {
                            NODE_ENV: 'development'
                        }
                    };
                </script>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;

        // Enable webview logging and message handling
        webviewView.webview.onDidReceiveMessage(
            async (message: VSCodeMessage<VSCodeMessageType>) => {
                console.log('Received message from webview:', message);
                switch (message.type) {
                    case VSCodeMessageType.LOG:
                        console.log(
                            'Webview:',
                            (message.data as MessageDataType<VSCodeMessageType.LOG>).message
                        );
                        break;

                    case VSCodeMessageType.ERROR:
                        console.error(
                            'Webview Error:',
                            (message.data as MessageDataType<VSCodeMessageType.ERROR>).message
                        );
                        break;

                    case VSCodeMessageType.GET_FILE_TREE:
                        try {
                            const workspaceRoot = vscode.workspace.workspaceFolders?.[0];
                            if (!workspaceRoot) {
                                webviewView.webview.postMessage(
                                    createMessage(VSCodeMessageType.FILE_TREE, {
                                        tree: [],
                                        error: 'No workspace folder is open. Please open a folder or workspace first.',
                                    })
                                );
                                break;
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

                            webviewView.webview.postMessage(
                                createMessage(VSCodeMessageType.FILE_TREE, { tree })
                            );
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
                        break;

                    case VSCodeMessageType.READ_FILE:
                        try {
                            const filePath = (message.data as { path: string }).path;
                            const document = await vscode.workspace.openTextDocument(filePath);
                            const content = document.getText();
                            webviewView.webview.postMessage(
                                createMessage(VSCodeMessageType.FILE_CONTENT, { content })
                            );
                        } catch (error) {
                            console.error('Error reading file:', error);
                            // Send error message back to webview
                            webviewView.webview.postMessage(
                                createMessage(VSCodeMessageType.FILE_CONTENT, {
                                    content: `Error reading file: ${error instanceof Error ? error.message : String(error)}`,
                                    error: true,
                                })
                            );
                        }
                        break;

                    case VSCodeMessageType.OPEN_FILE:
                        try {
                            const filePath = (message.data as { path: string }).path;
                            const document = await vscode.workspace.openTextDocument(filePath);
                            await vscode.window.showTextDocument(document, { preview: false });
                        } catch (error) {
                            console.error('Error opening file:', error);
                        }
                        break;

                    case VSCodeMessageType.GET_WORKSPACE_PATH:
                        if (
                            vscode.workspace.workspaceFolders &&
                            vscode.workspace.workspaceFolders.length > 0
                        ) {
                            webviewView.webview.postMessage(
                                createMessage(VSCodeMessageType.WORKSPACE_PATH, {
                                    path: vscode.workspace.workspaceFolders[0].uri.fsPath,
                                })
                            );
                        }
                        break;

                    case VSCodeMessageType.GET_EDITOR_SELECTION_INFO:
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
                        break;

                    case VSCodeMessageType.CLEAR_STATE:
                        try {
                            // Get current state to preserve configuration
                            const currentState = webviewView.webview.getState() || {};
                            const configToPreserve = {
                                selectedModel: currentState.selectedModel,
                                aiBar: currentState.aiBar, // Preserve all aiBar settings
                            };

                            // Clear state but keep configuration
                            webviewView.webview.setState(configToPreserve);

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
                                await vscode.commands.executeCommand(
                                    'workbench.action.reloadWindow'
                                );
                            }
                        } catch (error) {
                            vscode.window.showErrorMessage(
                                'Failed to clear chat history: ' + error
                            );
                        }
                        break;
                }
            }
        );
    }
}

// This method is called when your extension is deactivated
export function deactivate() {
    console.log('AI Assistant extension is now deactivated!');
}
