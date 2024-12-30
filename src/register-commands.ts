import * as vscode from 'vscode';
import { AIAssistantViewProvider } from './webview-provider';
import { createMessage, VSCodeMessageType } from './webview/types/events';

export function registerCommands(
    context: vscode.ExtensionContext,
    provider: AIAssistantViewProvider
): void {
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
            view.webview.postMessage(createMessage(VSCodeMessageType.CLEAR_HISTORY));
        }
    });

    // Register settings command
    let settingsDisposable = vscode.commands.registerCommand('ai-bar.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', '@ext:ai-bar.ai-bar');
    });

    context.subscriptions.push(
        focusDisposable,
        toggleHistoryDisposable,
        newChatDisposable,
        openDisposable,
        clearStateDisposable,
        settingsDisposable
    );
}
