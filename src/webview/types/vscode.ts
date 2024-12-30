import { AIModel } from './ai';
import { ChatSession } from './chat';

export interface Disposable {
    dispose(): void;
}

export interface WebviewState {
    sessions: ChatSession[];
    currentSessionId: string | null;
    selectedModel: AIModel;
    config?: {
        temperature: number;
        maxTokens: number;
        maxHistoryLength: number;
        maxContextMessages: number;
        openaiApiKey: string;
        anthropicApiKey: string;
    };
}

export interface WebviewApi<T = WebviewState> {
    getState(): T;
    setState(state: T): void;
    postMessage(message: unknown): void;
    workspace?: {
        getConfiguration(section: string): any;
        onDidChangeConfiguration(
            callback: (e: { affectsConfiguration: (section: string) => boolean }) => void
        ): { dispose: () => void };
    };
}

declare global {
    interface Window {
        vscode: WebviewApi;
    }

    function acquireVsCodeApi(): WebviewApi;
}

export function getVsCodeApi(): WebviewApi {
    if (!window.vscode) {
        window.vscode = acquireVsCodeApi();
    }
    return window.vscode;
}

export {};
