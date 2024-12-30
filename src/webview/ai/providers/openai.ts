import { AIResponse, Message, OPENAI_MODELS, OpenAIConfig } from '../../types/ai';
import { BaseAI, StreamCallback } from '../base';
import { AIManager } from '../manager';

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

    protected async callAPI(messages: Message[], onChunk?: StreamCallback): Promise<AIResponse> {
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
                stream: !!onChunk,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
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
                                const content = json.choices[0]?.delta?.content || '';
                                if (content) {
                                    fullText += content;
                                    onChunk(content);
                                }
                                if (json.usage) {
                                    usage = json.usage;
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
