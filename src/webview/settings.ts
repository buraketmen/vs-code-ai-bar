import { VSCodeMessageType } from './types/events';
import { getVsCodeApi } from './types/vscode';
import { logDebug } from './utils/logger';

export class Settings {
    private static instance: Settings;
    private configCache: Record<string, any> = {};
    private vscode = getVsCodeApi();
    private configListener: (event: MessageEvent) => void;
    private configPromise: Promise<void>;
    private configResolve!: () => void;
    private configChangeCallbacks: Set<() => void> = new Set();

    private constructor() {
        // Create promise to track initial configuration
        this.configPromise = new Promise((resolve) => {
            this.configResolve = resolve;
        });

        // Create configuration listener
        this.configListener = (event: MessageEvent) => {
            const message = event.data;
            if (message.type === VSCodeMessageType.CONFIGURATION_UPDATE) {
                const oldConfig = { ...this.configCache };
                this.configCache = message.data.configuration;
                logDebug('Extension configuration updated');

                // Resolve initial config promise if not already resolved
                if (this.configPromise) {
                    this.configResolve();
                    this.configPromise = null as any;
                }

                // Notify all listeners if config actually changed
                if (JSON.stringify(oldConfig) !== JSON.stringify(this.configCache)) {
                    this.notifyConfigChange();
                }
            }
        };

        // Add listener and request initial configuration
        window.addEventListener('message', this.configListener);
        this.vscode.postMessage({ type: VSCodeMessageType.GET_CONFIGURATION });
    }

    private notifyConfigChange() {
        this.configChangeCallbacks.forEach((callback) => callback());
    }

    public onConfigChange(callback: () => void): () => void {
        this.configChangeCallbacks.add(callback);
        return () => {
            this.configChangeCallbacks.delete(callback);
        };
    }

    private dispose() {
        window.removeEventListener('message', this.configListener);
        this.configChangeCallbacks.clear();
    }

    private async ensureConfig() {
        if (this.configPromise) {
            await this.configPromise;
        }
    }

    public static getInstance(): Settings {
        if (!Settings.instance) {
            Settings.instance = new Settings();
        }
        return Settings.instance;
    }

    public static dispose() {
        if (Settings.instance) {
            Settings.instance.dispose();
            Settings.instance = null as any;
        }
    }

    public static onConfigChange(callback: () => void): () => void {
        return Settings.getInstance().onConfigChange(callback);
    }

    public static async getTemperature(): Promise<number> {
        const instance = Settings.getInstance();
        await instance.ensureConfig();
        return instance.configCache['ai.temperature'] ?? 0.7;
    }

    public static async getMaxTokens(): Promise<number> {
        const instance = Settings.getInstance();
        await instance.ensureConfig();
        return instance.configCache['ai.maxTokens'] ?? 2000;
    }

    public static async getMaxHistoryLength(): Promise<number> {
        const instance = Settings.getInstance();
        await instance.ensureConfig();
        return instance.configCache['ai.maxHistoryLength'] ?? 50;
    }

    public static async getMaxContextMessages(): Promise<number> {
        const instance = Settings.getInstance();
        await instance.ensureConfig();
        return instance.configCache['ai.maxContextMessages'] ?? 5;
    }

    public static async getOpenAIKey(): Promise<string> {
        const instance = Settings.getInstance();
        await instance.ensureConfig();
        const key = instance.configCache['api.openaiApiKey'];
        return key;
    }

    public static async getAnthropicKey(): Promise<string> {
        const instance = Settings.getInstance();
        await instance.ensureConfig();
        const key = instance.configCache['api.anthropicApiKey'];
        return key;
    }
}
