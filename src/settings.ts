import * as vscode from 'vscode';
import { AI_MODELS, AIModel } from './webview/types/ai';

export class Settings {
    private static readonly CONFIG_SECTION = 'aiBar';

    static getOpenAIKey(): string {
        return this.get<string>('api.openai', '');
    }

    static getAnthropicKey(): string {
        return this.get<string>('api.anthropic', '');
    }

    static getDefaultModel(): AIModel {
        return this.get<AIModel>('model.default', AI_MODELS.chatgpt[0]);
    }

    private static get<T>(key: string, defaultValue: T): T {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        return config.get<T>(key, defaultValue);
    }

    static onDidChangeConfiguration(callback: () => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(this.CONFIG_SECTION)) {
                callback();
            }
        });
    }
}
