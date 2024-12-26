import { ChatGPTModel } from '../types';
import { BaseAI } from './base-ai';
import { AIConfig, AIResponse, Message } from './types';

interface ChatGPTConfig extends AIConfig {
    model?: ChatGPTModel;
}

export class ChatGPT extends BaseAI {
    constructor(config: ChatGPTConfig) {
        super({
            model: 'gpt-3.5-turbo',
            ...config,
        });
    }

    async callAPI(messages: Message[]): Promise<AIResponse> {
        if (!this.config.apiKey) {
            throw new Error(`OpenAI API key is required.`);
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                model: this.config.model,
                messages,
                temperature: this.config.temperature,
                max_tokens: this.config.maxTokens,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`);
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
        return 'ChatGPT';
    }

    getDescription(): string {
        return `OpenAI's ChatGPT (${this.config.model})`;
    }
}
