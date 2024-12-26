import { ChatGPTModel } from '../types';
import { AICommand, AIConfig, AIResponse, BaseAI, CommandPrompt } from './base-ai';

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

    protected initializeCommandPrompts(): Map<AICommand, CommandPrompt> {
        const prompts = new Map<AICommand, CommandPrompt>();

        prompts.set(AICommand.OPTIMIZE_CODE, {
            command: AICommand.OPTIMIZE_CODE,
            systemPrompt:
                'You are an expert code optimizer. Analyze the code and suggest optimizations for better performance, readability, and maintainability.',
            userPromptTemplate:
                'Please optimize the following code:\n\n{code}\n\nFocus on: {focus}',
        });

        prompts.set(AICommand.SECURITY_CHECK, {
            command: AICommand.SECURITY_CHECK,
            systemPrompt:
                'You are a security expert. Analyze the code for potential security vulnerabilities and suggest improvements.',
            userPromptTemplate: 'Please perform a security check on the following code:\n\n{code}',
        });

        prompts.set(AICommand.TEST_COVERAGE, {
            command: AICommand.TEST_COVERAGE,
            systemPrompt:
                'You are a testing expert. Analyze the code and its test files to evaluate test coverage and suggest improvements.',
            userPromptTemplate:
                'Please analyze the test coverage for:\nMain code:\n{code}\n\nTest files:\n{testFiles}',
        });

        prompts.set(AICommand.EXPLAIN_CODE, {
            command: AICommand.EXPLAIN_CODE,
            systemPrompt:
                'You are a code explanation expert. Break down the code and explain its functionality in a clear and concise manner.',
            userPromptTemplate: 'Please explain the following code:\n\n{code}',
        });

        prompts.set(AICommand.REFACTOR_CODE, {
            command: AICommand.REFACTOR_CODE,
            systemPrompt:
                'You are a refactoring expert. Analyze the code and suggest structural improvements while maintaining functionality.',
            userPromptTemplate:
                'Please suggest refactoring for the following code:\n\n{code}\n\nFocus on: {focus}',
        });

        prompts.set(AICommand.ADD_TYPES, {
            command: AICommand.ADD_TYPES,
            systemPrompt:
                'You are a TypeScript expert. Add appropriate type annotations to improve type safety.',
            userPromptTemplate: 'Please add type annotations to the following code:\n\n{code}',
        });

        prompts.set(AICommand.ADD_DOCUMENTATION, {
            command: AICommand.ADD_DOCUMENTATION,
            systemPrompt:
                'You are a documentation expert. Add clear and comprehensive documentation to the code.',
            userPromptTemplate: 'Please add documentation to the following code:\n\n{code}',
        });

        prompts.set(AICommand.FIX_BUGS, {
            command: AICommand.FIX_BUGS,
            systemPrompt:
                'You are a debugging expert. Identify and fix potential bugs in the code.',
            userPromptTemplate: 'Please identify and fix bugs in the following code:\n\n{code}',
        });

        prompts.set(AICommand.SUGGEST_IMPROVEMENTS, {
            command: AICommand.SUGGEST_IMPROVEMENTS,
            systemPrompt:
                'You are a code improvement expert. Suggest ways to enhance the code quality, performance, and user experience.',
            userPromptTemplate: 'Please suggest improvements for the following code:\n\n{code}',
        });

        return prompts;
    }

    async sendMessage(message: string, context: string[] = []): Promise<AIResponse> {
        if (!this.config.apiKey) {
            throw new Error('OpenAI API key is required');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    ...context.map((text) => ({ role: 'system' as const, content: text })),
                    { role: 'user' as const, content: message },
                ],
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
