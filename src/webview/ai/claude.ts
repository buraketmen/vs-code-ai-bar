import { AIConfig, AIResponse, ClaudeModel, Message } from '../types/ai';
import { BaseAI } from './base-ai';

interface ClaudeConfig extends AIConfig {
    model?: ClaudeModel;
}

export class Claude extends BaseAI {
    constructor(config: ClaudeConfig) {
        super({
            model: 'claude-3-sonnet-20240229',
            ...config,
        });
    }

    async callAPI(messages: Message[]): Promise<AIResponse> {
        if (!this.config.apiKey) {
            throw new Error('Anthropic API key is required');
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.config.model,
                messages,
                max_tokens: this.config.maxTokens,
            }),
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.statusText}`);
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

    getDescription(): string {
        return `Anthropic's Claude (${this.config.model})`;
    }
}
