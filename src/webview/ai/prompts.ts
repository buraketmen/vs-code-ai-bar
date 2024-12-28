import { AICommand, CommandPrompt } from '../types/ai';

const PROMPTS: Record<AICommand, CommandPrompt> = {
    [AICommand.CHAT]: {
        command: AICommand.CHAT,
        systemPrompt:
            'You are a helpful AI coding assistant. You help users with their programming questions and tasks in a clear and concise manner.',
        userPromptTemplate: '{message}',
    },

    [AICommand.OPTIMIZE_CODE]: {
        command: AICommand.OPTIMIZE_CODE,
        systemPrompt:
            'You are an expert code optimizer. Analyze the code and suggest optimizations for better performance, readability, and maintainability.',
        userPromptTemplate: 'Please optimize the following code:\n\n{code}\n\nFocus on: {focus}',
    },

    [AICommand.SECURITY_CHECK]: {
        command: AICommand.SECURITY_CHECK,
        systemPrompt:
            'You are a security expert. Analyze the code for potential security vulnerabilities and suggest improvements.',
        userPromptTemplate: 'Please perform a security check on the following code:\n\n{code}',
    },

    [AICommand.TEST_COVERAGE]: {
        command: AICommand.TEST_COVERAGE,
        systemPrompt:
            'You are a testing expert. Analyze the code and its test files to evaluate test coverage and suggest improvements.',
        userPromptTemplate:
            'Please analyze the test coverage for:\nMain code:\n{code}\n\nTest files:\n{testFiles}',
    },

    [AICommand.EXPLAIN_CODE]: {
        command: AICommand.EXPLAIN_CODE,
        systemPrompt:
            'You are a code explanation expert. Break down the code and explain its functionality in a clear and concise manner.',
        userPromptTemplate: 'Please explain the following code:\n\n{code}',
    },

    [AICommand.REFACTOR_CODE]: {
        command: AICommand.REFACTOR_CODE,
        systemPrompt:
            'You are a refactoring expert. Analyze the code and suggest structural improvements while maintaining functionality.',
        userPromptTemplate:
            'Please suggest refactoring for the following code:\n\n{code}\n\nFocus on: {focus}',
    },

    [AICommand.ADD_TYPES]: {
        command: AICommand.ADD_TYPES,
        systemPrompt:
            'You are a TypeScript expert. Add appropriate type annotations to improve type safety.',
        userPromptTemplate: 'Please add type annotations to the following code:\n\n{code}',
    },

    [AICommand.ADD_DOCUMENTATION]: {
        command: AICommand.ADD_DOCUMENTATION,
        systemPrompt:
            'You are a documentation expert. Add clear and comprehensive documentation to the code.',
        userPromptTemplate: 'Please add documentation to the following code:\n\n{code}',
    },

    [AICommand.FIX_BUGS]: {
        command: AICommand.FIX_BUGS,
        systemPrompt: 'You are a debugging expert. Identify and fix potential bugs in the code.',
        userPromptTemplate: 'Please identify and fix bugs in the following code:\n\n{code}',
    },

    [AICommand.SUGGEST_IMPROVEMENTS]: {
        command: AICommand.SUGGEST_IMPROVEMENTS,
        systemPrompt:
            'You are a code improvement expert. Suggest ways to enhance the code quality, performance, and user experience.',
        userPromptTemplate: 'Please suggest improvements for the following code:\n\n{code}',
    },
};

export function getPrompts(): Map<AICommand, CommandPrompt> {
    return new Map(Object.entries(PROMPTS) as [AICommand, CommandPrompt][]);
}

export function getPrompt(command: AICommand): CommandPrompt {
    const prompt = PROMPTS[command];
    if (!prompt) {
        throw new Error(`No prompt found for command: ${command}`);
    }
    return prompt;
}
