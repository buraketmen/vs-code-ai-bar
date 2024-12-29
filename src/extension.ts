// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { registerCommands } from './register-commands';
import { AIAssistantViewProvider } from './webview-provider';
import { createMessage, VSCodeMessageType } from './webview/types/events';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Create output channel
    const outputChannel = vscode.window.createOutputChannel('AI Assistant');
    outputChannel.show();
    outputChannel.appendLine('AI Assistant extension is now active!');

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

    // Register all commands
    registerCommands(context, provider);
}

// This method is called when your extension is deactivated
export function deactivate() {
    console.log('AI Assistant extension is now deactivated!');
}
