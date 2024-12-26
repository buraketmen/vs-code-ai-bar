import { ClaudeModel } from '../types';
import { AICommand, AIConfig, AIResponse, BaseAI, CommandPrompt } from './base-ai';

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

    protected initializeCommandPrompts(): Map<AICommand, CommandPrompt> {
        const prompts = new Map<AICommand, CommandPrompt>();

        prompts.set(AICommand.OPTIMIZE_CODE, {
            command: AICommand.OPTIMIZE_CODE,
            systemPrompt:
                'You are Claude, an expert code optimizer. Your task is to analyze code and suggest optimizations for better performance, readability, and maintainability.',
            userPromptTemplate:
                'Please optimize the following code:\n\n{code}\n\nFocus on: {focus}',
        });

        prompts.set(AICommand.SECURITY_CHECK, {
            command: AICommand.SECURITY_CHECK,
            systemPrompt:
                'You are Claude, a security expert. Your task is to analyze code for potential security vulnerabilities and suggest improvements.',
            userPromptTemplate: 'Please perform a security check on the following code:\n\n{code}',
        });

        prompts.set(AICommand.TEST_COVERAGE, {
            command: AICommand.TEST_COVERAGE,
            systemPrompt:
                'You are Claude, a testing expert. Your task is to analyze code and its test files to evaluate test coverage and suggest improvements.',
            userPromptTemplate:
                'Please analyze the test coverage for:\nMain code:\n{code}\n\nTest files:\n{testFiles}',
        });

        prompts.set(AICommand.EXPLAIN_CODE, {
            command: AICommand.EXPLAIN_CODE,
            systemPrompt:
                'You are Claude, a code explanation expert. Your task is to break down code and explain its functionality in a clear and concise manner.',
            userPromptTemplate: 'Please explain the following code:\n\n{code}',
        });

        prompts.set(AICommand.REFACTOR_CODE, {
            command: AICommand.REFACTOR_CODE,
            systemPrompt:
                'You are Claude, a refactoring expert. Your task is to analyze code and suggest structural improvements while maintaining functionality.',
            userPromptTemplate:
                'Please suggest refactoring for the following code:\n\n{code}\n\nFocus on: {focus}',
        });

        prompts.set(AICommand.ADD_TYPES, {
            command: AICommand.ADD_TYPES,
            systemPrompt:
                'You are Claude, a TypeScript expert. Your task is to add appropriate type annotations to improve type safety.',
            userPromptTemplate: 'Please add type annotations to the following code:\n\n{code}',
        });

        prompts.set(AICommand.ADD_DOCUMENTATION, {
            command: AICommand.ADD_DOCUMENTATION,
            systemPrompt:
                'You are Claude, a documentation expert. Your task is to add clear and comprehensive documentation to the code.',
            userPromptTemplate: 'Please add documentation to the following code:\n\n{code}',
        });

        prompts.set(AICommand.FIX_BUGS, {
            command: AICommand.FIX_BUGS,
            systemPrompt:
                'You are Claude, a debugging expert. Your task is to identify and fix potential bugs in the code.',
            userPromptTemplate: 'Please identify and fix bugs in the following code:\n\n{code}',
        });

        prompts.set(AICommand.SUGGEST_IMPROVEMENTS, {
            command: AICommand.SUGGEST_IMPROVEMENTS,
            systemPrompt:
                'You are Claude, a code improvement expert. Your task is to suggest ways to enhance code quality, performance, and user experience.',
            userPromptTemplate: 'Please suggest improvements for the following code:\n\n{code}',
        });

        return prompts;
    }

    async sendMessage(message: string, context: string[] = []): Promise<AIResponse> {
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
                messages: [
                    ...context.map((text) => ({ role: 'assistant', content: text })),
                    { role: 'user', content: message },
                ],
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
