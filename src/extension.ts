// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Create output channel
    const outputChannel = vscode.window.createOutputChannel('AI Assistant');
    outputChannel.show();
    outputChannel.appendLine('AI Assistant extension is now active!');

    let currentPanel: vscode.WebviewPanel | undefined = undefined;

    let disposable = vscode.commands.registerCommand('ai-bar.showPanel', () => {
        outputChannel.appendLine('Show panel command triggered');

        if (currentPanel) {
            outputChannel.appendLine('Revealing existing panel');
            currentPanel.reveal(vscode.ViewColumn.Two);
        } else {
            outputChannel.appendLine('Creating new panel');
            currentPanel = vscode.window.createWebviewPanel(
                'aiBar',
                'AI Assistant',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'dist'))],
                    // Enable DevTools
                    enableFindWidget: true,
                    retainContextWhenHidden: true,
                }
            );

            const scriptUri = currentPanel.webview.asWebviewUri(
                vscode.Uri.file(path.join(context.extensionPath, 'dist', 'webview.js'))
            );
            outputChannel.appendLine('Script URI: ' + scriptUri.toString());

            currentPanel.webview.html = getWebviewContent(scriptUri);
            outputChannel.appendLine('Webview HTML set');

            // Enable webview logging
            currentPanel.webview.onDidReceiveMessage(
                (message) => {
                    switch (message.type) {
                        case 'log':
                            outputChannel.appendLine('Webview: ' + message.message);
                            break;
                        case 'error':
                            outputChannel.appendLine('Webview Error: ' + message.message);
                            break;
                    }
                },
                undefined,
                context.subscriptions
            );

            currentPanel.onDidDispose(
                () => {
                    outputChannel.appendLine('Panel disposed');
                    currentPanel = undefined;
                },
                null,
                context.subscriptions
            );
        }
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(scriptUri: vscode.Uri) {
    const nonce = getNonce();

    const html = `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' vscode-resource:; script-src 'nonce-${nonce}' 'unsafe-eval' vscode-resource:; connect-src vscode-resource:; img-src vscode-resource: https:">
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
			<script nonce="${nonce}">
				try {
					window.vscode = acquireVsCodeApi();
				} catch (error) {
					console.error('Failed to acquire VS Code API:', error);
				}

				window.addEventListener('error', (event) => {
					console.error('Script error:', event.error);
				});

				console.log = function(...args) {
					window.vscode.postMessage({
						type: 'log',
						message: args.join(' ')
					});
				};

				console.error = function(...args) {
					window.vscode.postMessage({
						type: 'error',
						message: args.join(' ')
					});
				};

				window.process = {
					env: {
						NODE_ENV: 'development'
					}
				};
			</script>
			<script nonce="${nonce}" src="${scriptUri}" type="text/javascript"></script>
		</body>
		</html>`;

    return html;
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// This method is called when your extension is deactivated
export function deactivate() {}
