import { getPrompts } from './prompts';
import { AICommand, AIConfig, AIResponse, CommandParams, CommandPrompt } from './types';

export abstract class BaseAI {
    protected config: AIConfig;
    protected commandPrompts: Map<AICommand, CommandPrompt>;

    constructor(config: AIConfig) {
        this.config = {
            temperature: 0.7,
            maxTokens: 2000,
            ...config,
        };
        this.commandPrompts = this.initializeCommandPrompts();
    }

    protected initializeCommandPrompts(): Map<AICommand, CommandPrompt> {
        return getPrompts();
    }

    abstract sendMessage(message: string, context?: string[]): Promise<AIResponse>;

    abstract getName(): string;

    abstract getDescription(): string;

    getConfig(): AIConfig {
        return this.config;
    }

    updateConfig(newConfig: Partial<AIConfig>): void {
        this.config = {
            ...this.config,
            ...newConfig,
        };
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

        return this.sendMessage(userPrompt, [prompt.systemPrompt]);
    }

    getSupportedCommands(): AICommand[] {
        return Array.from(this.commandPrompts.keys());
    }

    getCommandPrompt(command: AICommand): CommandPrompt | undefined {
        return this.commandPrompts.get(command);
    }
}
