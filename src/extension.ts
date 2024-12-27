// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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
            provider.currentView.webview.postMessage({ type: 'fileCreated' });
        }
    });

    fileSystemWatcher.onDidDelete((uri) => {
        if (provider.currentView) {
            provider.currentView.webview.postMessage({ type: 'fileDeleted' });
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
        console.log('New chat command triggered');
        if (provider.currentView) {
            console.log('Sending newChat message to webview');
            provider.currentView.webview.postMessage({ type: 'newChat' });
        } else {
            console.log('No webview available');
        }
    });

    // Register history toggle command
    let toggleHistoryDisposable = vscode.commands.registerCommand('ai-bar.toggleHistory', () => {
        console.log('Toggle history command triggered');
        if (provider.currentView) {
            console.log('Sending toggleHistory message to webview');
            provider.currentView.webview.postMessage({ type: 'toggleHistory' });
        } else {
            console.log('No webview available');
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

    // Register openSettings command
    context.subscriptions.push(
        vscode.commands.registerCommand('ai-bar.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', '@ext:ai-bar.ai-bar');
        })
    );

    context.subscriptions.push(
        focusDisposable,
        toggleHistoryDisposable,
        newChatDisposable,
        openDisposable
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
                    }
                </style>
            </head>
            <body>
                <div id="root">
                    <div class="loading">Loading...</div>
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
        webviewView.webview.onDidReceiveMessage(async (message) => {
            console.log('Received message from webview:', message);
            switch (message.type) {
                case 'log':
                    console.log('Webview:', message.message);
                    break;
                case 'error':
                    console.error('Webview Error:', message.message);
                    break;
                case 'getFileTree':
                    try {
                        const workspaceRoot = vscode.workspace.workspaceFolders?.[0];
                        if (!workspaceRoot) {
                            webviewView.webview.postMessage({
                                type: 'fileTree',
                                tree: [],
                                error: 'No workspace folder is open. Please open a folder or workspace first.',
                            });
                            break;
                        }

                        const files = await vscode.workspace.findFiles(
                            message.data?.query ? `**/*${message.data.query}*` : '**/*',
                            '**/node_modules/**'
                        );

                        const tree = files.map((file) => ({
                            id: Buffer.from(file.fsPath).toString('base64'),
                            name: file.path.split('/').pop() || file.path,
                            path: file.fsPath,
                            type: 'file' as const,
                        }));

                        webviewView.webview.postMessage({
                            type: 'fileTree',
                            tree,
                        });
                    } catch (error) {
                        webviewView.webview.postMessage({
                            type: 'fileTree',
                            tree: [],
                            error:
                                'Error loading file tree: ' +
                                (error instanceof Error ? error.message : String(error)),
                        });
                    }
                    break;
                case 'readFile':
                    try {
                        const document = await vscode.workspace.openTextDocument(message.data.path);
                        const content = document.getText();

                        webviewView.webview.postMessage({
                            type: 'fileContent',
                            content,
                        });
                    } catch (error) {
                        console.error('Error reading file:', error);
                    }
                    break;
                case 'openFile':
                    try {
                        const document = await vscode.workspace.openTextDocument(message.data.path);
                        await vscode.window.showTextDocument(document, { preview: false });
                    } catch (error) {
                        console.error('Error opening file:', error);
                    }
                    break;
                case 'getWorkspacePath':
                    if (
                        vscode.workspace.workspaceFolders &&
                        vscode.workspace.workspaceFolders.length > 0
                    ) {
                        webviewView.webview.postMessage({
                            type: 'workspacePath',
                            path: vscode.workspace.workspaceFolders[0].uri.fsPath,
                        });
                    }
                    break;
                case 'getEditorSelectionInfo':
                    const editor = vscode.window.activeTextEditor;
                    if (editor) {
                        const selection = editor.selection;
                        const fullPath = editor.document.fileName;
                        const fileName = fullPath.split(/[\\/]/).pop() || fullPath;

                        webviewView.webview.postMessage({
                            type: 'editorSelectionInfo',
                            data: {
                                fileName,
                                fullPath,
                                startLine: selection.start.line + 1,
                                endLine: selection.end.line + 1,
                            },
                        });
                    }
                    break;
            }
        });
    }

    private _getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}
