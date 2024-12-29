import * as vscode from 'vscode';
import { handleWebviewMessage } from './message-handler';
import { VSCodeMessage, VSCodeMessageType } from './webview/types/events';

export class AIAssistantViewProvider implements vscode.WebviewViewProvider {
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
                await handleWebviewMessage(message, webviewView);
            }
        );
    }
}
