export interface VSCodeApi {
    postMessage(message: any): void;
    setState(state: any): void;
    getState(): any;
    workspace?: {
        getConfiguration(section: string): any;
        onDidChangeConfiguration(
            callback: (e: { affectsConfiguration(section: string): boolean }) => void
        ): void;
    };
}

declare global {
    interface Window {
        vscode: VSCodeApi;
    }

    function acquireVsCodeApi(): VSCodeApi;
}

export {};
