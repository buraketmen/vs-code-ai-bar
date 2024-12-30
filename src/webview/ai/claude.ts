import { AIResponse, CLAUDE_MODELS, ClaudeConfig, Message } from '../types/ai';
import { AIManager } from './ai-manager';
import { BaseAI } from './base-ai';

export class Claude extends BaseAI {
    constructor(config: ClaudeConfig) {
        super({
            ...config,
            model: config.model || CLAUDE_MODELS.SONNET,
        });
    }

    protected async validateConfig(): Promise<void> {
        const config = await this.getConfig();
        if (!config.anthropicApiKey) {
            throw new Error('Anthropic API key is required');
        }
        if (!config.model || !AIManager.isClaudeModel(config.model)) {
            throw new Error('Invalid Claude model');
        }
    }

    protected async callAPI(messages: Message[]): Promise<AIResponse> {
        await this.validateConfig();
        const config = await this.getConfig();

        if (!config.anthropicApiKey) {
            throw new Error('Anthropic API key is required');
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config.anthropicApiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: config.model,
                messages: messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                max_tokens: config.maxTokens,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            text: data.content[0].text,
            usage: {
                promptTokens: data.usage.input_tokens,
                completionTokens: data.usage.output_tokens,
                totalTokens: data.usage.input_tokens + data.usage.output_tokens,
            },
        };
    }

    getName(): string {
        return 'Claude';
    }

    async getDescription(): Promise<string> {
        const config = await this.getConfig();
        return `Anthropic's model (${config.model})`;
    }
}
