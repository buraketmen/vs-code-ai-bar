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
        webviewView.webview.onDidReceiveMessage((message) => {
            console.log('Received message from webview:', message);
            switch (message.type) {
                case 'log':
                    console.log('Webview:', message.message);
                    break;
                case 'error':
                    console.error('Webview Error:', message.message);
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
