import { Settings } from '../settings';
import {
    AICommand,
    AIConfig,
    AIResponse,
    CommandParams,
    CommandPrompt,
    Message,
} from '../types/ai';
import { getPrompts } from './prompts';

export abstract class BaseAI {
    protected config: AIConfig;
    protected commandPrompts: Map<AICommand, CommandPrompt>;
    protected messageHistory: Message[] = [];

    constructor(config: AIConfig) {
        this.config = config;
        this.commandPrompts = getPrompts();
    }

    protected abstract validateConfig(): Promise<void>;
    protected abstract callAPI(messages: Message[]): Promise<AIResponse>;
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

    async sendMessage(message: string, systemContext?: string): Promise<AIResponse> {
        const messages: Message[] = await this.getRelevantHistory();

        if (systemContext && !messages.some((m) => m.role === 'system')) {
            messages.unshift({ role: 'system', content: systemContext });
            this.messageHistory.unshift({ role: 'system', content: systemContext });
        }

        const response = await this.callAPI([...messages, { role: 'user', content: message }]);

        this.messageHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: response.text }
        );

        const config = await this.getConfig();
        if (this.messageHistory.length > (config.maxHistoryLength || 50)) {
            const systemMessages = this.messageHistory.filter((m) => m.role === 'system');
            const nonSystemMessages = this.messageHistory
                .filter((m) => m.role !== 'system')
                .slice(-(config.maxHistoryLength! - systemMessages.length));

            this.messageHistory = [...systemMessages?.slice(0, 1), ...nonSystemMessages];
        }

        return response;
    }

    async executeCommand<T extends AICommand>(
        command: T,
        params: CommandParams[T]
    ): Promise<AIResponse> {
        const prompt = this.commandPrompts.get(command);
        if (!prompt) {
            throw new Error(`Command ${command} not supported by ${this.getName()}`);
        }

        let userPrompt = prompt.userPromptTemplate;
        Object.entries(params).forEach(([key, value]) => {
            userPrompt = userPrompt.replace(`{${key}}`, value);
        });

        return this.sendMessage(userPrompt, prompt.systemPrompt);
    }

    getSupportedCommands(): AICommand[] {
        return Array.from(this.commandPrompts.keys());
    }

    getCommandPrompt(command: AICommand): CommandPrompt | undefined {
        return this.commandPrompts.get(command);
    }

    clearHistory(): void {
        this.messageHistory = [];
    }

    getHistory(): Message[] {
        return [...this.messageHistory];
    }
}
