import { Settings } from '../settings';
import { AICommand, AIConfig, AIResponse, AttachedFile, CommandParams, Message } from '../types/ai';
import { formatMessage } from './prompts';

export type StreamCallback = (chunk: string) => void;

export abstract class BaseAI {
    protected config: AIConfig;
    protected messageHistory: Message[] = [];

    constructor(config: AIConfig) {
        this.config = config;
    }

    protected abstract validateConfig(): Promise<void>;
    protected abstract callAPI(messages: Message[], onChunk?: StreamCallback): Promise<AIResponse>;
    abstract getName(): string;
    abstract getDescription(): Promise<string>;

    protected async getConfig(): Promise<AIConfig> {
        return {
            temperature: await Settings.getTemperature(),
            maxTokens: await Settings.getMaxTokens(),
            maxHistoryLength: await Settings.getMaxHistoryLength(),
            maxContextMessages: await Settings.getMaxContextMessages(),
            openaiApiKey: await Settings.getOpenAIKey(),
            anthropicApiKey: await Settings.getAnthropicKey(),
            ...this.config, // Model-specific config overrides
        };
    }

    async updateConfig(newConfig: Partial<AIConfig>): Promise<void> {
        this.config = {
            ...this.config,
            ...newConfig,
        };
    }

    protected async getRelevantHistory(): Promise<Message[]> {
        const config = await this.getConfig();
        const history = [...this.messageHistory];
        const maxMessages = config.maxContextMessages || 5;

        if (history.length <= maxMessages) {
            return history;
        }

        const systemMessages = history.filter((msg) => msg.role === 'system');
        const nonSystemMessages = history.filter((msg) => msg.role !== 'system');

        return [...systemMessages.slice(0, 1), ...nonSystemMessages].slice(-maxMessages);
    }

    async execute<T extends AICommand>(
        command: T,
        params: CommandParams[T],
        onChunk?: StreamCallback
    ): Promise<AIResponse> {
        // Get config once at the beginning
        const config = await this.getConfig();

        // Get current history using config
        const maxMessages = config.maxContextMessages || 5;
        const history = [...this.messageHistory];

        if (history.length > maxMessages) {
            const systemMessages = history.filter((m) => m.role === 'system');
            const nonSystemMessages = history.filter((m) => m.role !== 'system');
            history.splice(
                0,
                history.length,
                ...systemMessages.slice(0, 1),
                ...nonSystemMessages.slice(-maxMessages)
            );
        }

        // Format new messages
        const newMessages = formatMessage(command, {
            message: 'message' in params ? params.message : '',
            codeSelection: 'code' in params ? params.code : undefined,
            images: 'images' in params ? (params.images as string[]) : undefined,
            files: 'files' in params ? (params.files as AttachedFile[]) : undefined,
        });

        // Handle system message
        const hasSystemMessage = history.some((m) => m.role === 'system');
        const systemMessage = newMessages.find((m) => m.role === 'system');

        if (!hasSystemMessage && systemMessage) {
            this.messageHistory.unshift(systemMessage);
            newMessages.splice(newMessages.indexOf(systemMessage), 1);
        }

        // Combine history with new messages
        const messages = [...history, ...newMessages];

        // Call API
        const response = await this.callAPI(messages, onChunk);

        // Update history
        newMessages.forEach((msg) => {
            this.messageHistory.push(msg);
        });
        this.messageHistory.push({ role: 'assistant', content: response.text });

        // Trim history if needed
        const maxHistoryLength = config.maxHistoryLength || 50;
        if (this.messageHistory.length > maxHistoryLength) {
            const systemMessages = this.messageHistory.filter((m) => m.role === 'system');
            const nonSystemMessages = this.messageHistory
                .filter((m) => m.role !== 'system')
                .slice(-(maxHistoryLength - systemMessages.length));

            this.messageHistory = [...systemMessages.slice(0, 1), ...nonSystemMessages];
        }

        return response;
    }

    protected supportsAttachments(): boolean {
        return true; // Override in specific AI implementations that support attachments
    }

    getSupportedCommands(): AICommand[] {
        return Object.values(AICommand);
    }

    clearHistory(): void {
        this.messageHistory = [];
    }

    getHistory(): Message[] {
        return [...this.messageHistory];
    }
}
