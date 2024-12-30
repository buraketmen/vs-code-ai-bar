import { AIResponse, CLAUDE_MODELS, ClaudeConfig, Message } from '../../types/ai';
import { BaseAI, StreamCallback } from '../base';
import { AIManager } from '../manager';

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

    protected async callAPI(messages: Message[], onChunk?: StreamCallback): Promise<AIResponse> {
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
                stream: !!onChunk,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
        }

        if (onChunk) {
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            let usage = {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
            };

            if (reader) {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            break;
                        }

                        const chunk = decoder.decode(value);
                        const lines = chunk
                            .split('\n')
                            .filter((line) => line.trim().startsWith('data: '))
                            .map((line) => line.replace('data: ', '').trim())
                            .filter((line) => line !== '[DONE]' && line.length > 0);

                        for (const line of lines) {
                            try {
                                const json = JSON.parse(line);
                                const content = json.delta?.text || '';
                                if (content) {
                                    fullText += content;
                                    onChunk(content);
                                }
                                if (json.usage) {
                                    usage = {
                                        promptTokens: json.usage.input_tokens,
                                        completionTokens: json.usage.output_tokens,
                                        totalTokens:
                                            json.usage.input_tokens + json.usage.output_tokens,
                                    };
                                }
                            } catch (e) {
                                console.warn('Failed to parse streaming response line:', line);
                            }
                        }
                    }
                } finally {
                    reader.releaseLock();
                }
            }

            return {
                text: fullText,
                usage,
            };
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
