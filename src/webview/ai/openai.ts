import { AIResponse, Message, OPENAI_MODELS, OpenAIConfig } from '../types/ai';
import { AIManager } from './ai-manager';
import { BaseAI } from './base-ai';

export class OpenAI extends BaseAI {
    constructor(config: OpenAIConfig) {
        super({
            ...config,
            model: config.model || OPENAI_MODELS.GPT4,
        });
    }

    protected async validateConfig(): Promise<void> {
        const config = await this.getConfig();
        if (!config.openaiApiKey) {
            throw new Error('OpenAI API key is required.');
        }
        if (!config.model || !AIManager.isOpenAIModel(config.model)) {
            throw new Error('Invalid OpenAI model.');
        }
    }

    protected async callAPI(messages: Message[]): Promise<AIResponse> {
        await this.validateConfig();
        const config = await this.getConfig();

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.openaiApiKey}`,
            },
            body: JSON.stringify({
                model: config.model,
                messages: messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
                temperature: config.temperature,
                max_tokens: config.maxTokens,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return {
            text: data.choices[0].message.content,
            usage: {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens,
            },
        };
    }

    getName(): string {
        return 'OpenAI';
    }

    async getDescription(): Promise<string> {
        const config = await this.getConfig();
        return `OpenAI's model (${config.model})`;
    }
}
