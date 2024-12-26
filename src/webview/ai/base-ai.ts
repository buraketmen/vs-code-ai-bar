export interface AIConfig {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface AIResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export enum AICommand {
    OPTIMIZE_CODE = 'optimize_code',
    SECURITY_CHECK = 'security_check',
    TEST_COVERAGE = 'test_coverage',
    EXPLAIN_CODE = 'explain_code',
    REFACTOR_CODE = 'refactor_code',
    ADD_TYPES = 'add_types',
    ADD_DOCUMENTATION = 'add_documentation',
    FIX_BUGS = 'fix_bugs',
    SUGGEST_IMPROVEMENTS = 'suggest_improvements',
}

export interface CommandPrompt {
    command: AICommand;
    systemPrompt: string;
    userPromptTemplate: string;
}

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

    protected abstract initializeCommandPrompts(): Map<AICommand, CommandPrompt>;

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

    async executeCommand(command: AICommand, params: Record<string, any>): Promise<AIResponse> {
        const prompt = this.commandPrompts.get(command);
        if (!prompt) {
            throw new Error(`Command ${command} not supported by ${this.getName()}`);
        }

        // Replace placeholders in the template with actual values
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
