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
        // Get configuration from VS Code settings
        const vscodeConfig = window.vscode?.workspace?.getConfiguration('aiBar.ai') || {};

        this.config = {
            temperature: vscodeConfig.temperature ?? 0.7,
            maxTokens: vscodeConfig.maxTokens ?? 2000,
            maxHistoryLength: vscodeConfig.maxHistoryLength ?? 50,
            maxContextMessages: vscodeConfig.maxContextMessages ?? 5,
            ...config, // Allow overriding with passed config
        };

        this.commandPrompts = this.initializeCommandPrompts();

        // Listen for configuration changes
        window.vscode?.workspace?.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('aiBar.ai')) {
                const newConfig = window.vscode?.workspace?.getConfiguration('aiBar.ai');
                this.updateConfig({
                    temperature: newConfig.temperature ?? this.config.temperature,
                    maxTokens: newConfig.maxTokens ?? this.config.maxTokens,
                    maxHistoryLength: newConfig.maxHistoryLength ?? this.config.maxHistoryLength,
                    maxContextMessages:
                        newConfig.maxContextMessages ?? this.config.maxContextMessages,
                });
            }
        });
    }

    protected initializeCommandPrompts(): Map<AICommand, CommandPrompt> {
        return getPrompts();
    }

    abstract callAPI(messages: Message[]): Promise<AIResponse>;

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

    protected getRelevantHistory(): Message[] {
        // TODO: Get relevant history from session
        const history = [...this.messageHistory];
        const maxMessages = this.config.maxContextMessages || 5;

        if (history.length <= maxMessages) {
            return history;
        }

        const systemMessages = history.filter((msg) => msg.role === 'system');
        const nonSystemMessages = history.filter((msg) => msg.role !== 'system');

        // Get only one system message
        return [...systemMessages.slice(0, 1), ...nonSystemMessages].slice(
            -this.config.maxContextMessages!
        );
    }

    async sendMessage(message: string, systemContext?: string): Promise<AIResponse> {
        const messages: Message[] = this.getRelevantHistory();

        // Ensure system context is added if not already present
        if (systemContext && !messages.some((m) => m.role === 'system')) {
            messages.unshift({ role: 'system', content: systemContext });
            this.messageHistory.unshift({ role: 'system', content: systemContext });
        }

        const response = await this.callAPI([...messages, { role: 'user', content: message }]);

        this.messageHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: response.text }
        );

        if (this.messageHistory.length > (this.config.maxHistoryLength || 50)) {
            const systemMessages = this.messageHistory.filter((m) => m.role === 'system');
            const nonSystemMessages = this.messageHistory
                .filter((m) => m.role !== 'system')
                .slice(-(this.config.maxHistoryLength! - systemMessages.length));

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
