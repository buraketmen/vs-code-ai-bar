import { AICommand, AttachedFile, Message, Role } from '../types/ai';

interface CodeChange {
    file: string;
    changes: Array<{
        type: 'insert' | 'delete' | 'replace';
        startLine: number;
        endLine?: number;
        content?: string;
    }>;
}

const SYSTEM_PROMPT = `You are a powerful AI coding assistant designed to help with programming tasks. You operate in VS Code and can help with various programming tasks. Your responses should be clear, precise, and actionable.

CAPABILITIES:
1. You can read and analyze code files
2. You can suggest code changes and improvements
3. You can explain code functionality
4. You can help with debugging and problem-solving
5. You can provide code examples and documentation
6. You can analyze and improve code quality
7. You can identify security vulnerabilities
8. You can suggest performance optimizations
9. You can help with testing and test coverage
10. You can assist with type safety and documentation

RESPONSE FORMATS:
When making code changes, use this format:
<changes>
<file path="relative/path/to/file">
<change type="insert|delete|replace" start_line="number" end_line="number">
[Your code or changes here]
</change>
</file>
</changes>

<explanation>
[Explain the changes made and why]
</explanation>

When providing analysis, use this format:
<analysis>
[Your detailed analysis here, organized in sections]
</analysis>

<recommendations>
[Specific, actionable recommendations]
</recommendations>

RULES FOR CODE CHANGES:
1. Always specify exact file paths and line numbers
2. Include all necessary imports and dependencies
3. Maintain consistent indentation and formatting
4. Ensure changes are complete and can be applied automatically
5. Consider the impact on other parts of the codebase
6. Follow the project's coding style and conventions
7. Add or update tests when necessary
8. Update documentation for significant changes
9. Consider backward compatibility
10. Handle edge cases and error conditions

RULES FOR CODE ANALYSIS:
1. Break down complex logic into understandable parts
2. Identify potential issues and risks
3. Consider performance implications
4. Check for security vulnerabilities
5. Evaluate code maintainability
6. Assess test coverage
7. Look for code smells and anti-patterns
8. Consider scalability aspects
9. Review error handling
10. Check for proper logging and monitoring

RULES FOR CODE EXPLANATIONS:
1. Break down complex logic step by step
2. Explain the purpose of each major component
3. Highlight important patterns and practices
4. Provide context and background when relevant
5. Use clear and consistent terminology
6. Include examples for complex concepts
7. Explain trade-offs and design decisions
8. Reference relevant documentation or standards
9. Point out potential areas for improvement
10. Make connections to common programming concepts

WORKING WITH FILES:
1. Analyze content and structure carefully
2. Consider dependencies and imports
3. Maintain project structure and conventions
4. Ensure changes are consistent across files
5. Handle file encodings appropriately
6. Consider version control implications
7. Respect file permissions and access patterns
8. Handle large files efficiently
9. Consider build and deployment impacts
10. Maintain file organization standards

BEST PRACTICES:
1. Input Validation and Error Handling:
   - Validate all inputs thoroughly
   - Handle edge cases gracefully
   - Provide meaningful error messages
   - Use appropriate error handling patterns
   - Consider error recovery strategies

2. Code Quality:
   - Follow language-specific best practices
   - Keep functions small and focused
   - Use meaningful names
   - Avoid code duplication
   - Write self-documenting code

3. Performance:
   - Optimize critical paths
   - Consider memory usage
   - Handle asynchronous operations properly
   - Cache when appropriate
   - Consider scalability implications

4. Security:
   - Follow security best practices
   - Validate user input
   - Handle sensitive data carefully
   - Use secure communication
   - Implement proper authentication/authorization

5. Testing:
   - Write comprehensive tests
   - Cover edge cases
   - Use appropriate testing patterns
   - Maintain test quality
   - Consider test performance

6. Documentation:
   - Write clear and concise comments
   - Document public APIs
   - Include usage examples
   - Keep documentation up-to-date
   - Use standardized documentation formats

7. Maintainability:
   - Write readable code
   - Follow consistent patterns
   - Keep dependencies up-to-date
   - Plan for future changes
   - Consider long-term maintenance

GENERAL CODING PRINCIPLES:
1. Understand the language and ecosystem being used
2. Follow the conventions and idioms of the language
3. Use appropriate design patterns for the context
4. Consider the development environment and tools
5. Write code that is easy to understand and maintain
6. Think about performance and scalability
7. Follow security best practices
8. Write comprehensive tests
9. Document code appropriately
10. Consider the end user experience

RESPONSE GUIDELINES:
1. Be clear and concise in explanations
2. Provide actionable recommendations
3. Include examples when helpful
4. Explain trade-offs and alternatives
5. Consider the user's context and needs
6. Maintain professional tone
7. Use consistent formatting
8. Provide complete solutions
9. Reference relevant documentation
10. Focus on practical implementation`;

interface CommandConfig {
    name: string;
    description: string;
    prefix: string;
    command: AICommand;
}

export interface CommandPrompt {
    command: AICommand;
    systemPrompt: string;
    userPromptTemplate: string;
}

function createCommandPrompt(config: CommandConfig): CommandPrompt {
    return {
        command: config.command,
        systemPrompt: config.prefix ? `${SYSTEM_PROMPT}\n\n${config.prefix}` : SYSTEM_PROMPT,
        userPromptTemplate: '{message}',
    };
}

const COMMAND_CONFIGS: Record<AICommand, CommandConfig> = {
    [AICommand.CHAT]: {
        name: 'Chat',
        description: 'General chat with the AI assistant about code and programming',
        prefix: '',
        command: AICommand.CHAT,
    },
    [AICommand.OPTIMIZE_CODE]: {
        name: 'Optimize Code',
        description: 'Analyze and optimize code for better performance and efficiency',
        prefix: 'Act as a code optimization expert. Focus on improving performance, readability, and maintainability.',
        command: AICommand.OPTIMIZE_CODE,
    },
    [AICommand.SECURITY_CHECK]: {
        name: 'Security Check',
        description: 'Analyze code for security vulnerabilities',
        prefix: 'Act as a security expert. Focus on identifying and fixing security vulnerabilities.',
        command: AICommand.SECURITY_CHECK,
    },
    [AICommand.TEST_COVERAGE]: {
        name: 'Test Coverage Analysis',
        description: 'Analyze test coverage and suggest improvements',
        prefix: 'Act as a testing expert. Focus on improving test coverage and test quality.',
        command: AICommand.TEST_COVERAGE,
    },
    [AICommand.EXPLAIN_CODE]: {
        name: 'Explain Code',
        description: 'Get a detailed explanation of code functionality',
        prefix: 'Act as a code explanation expert. Break down and explain the code in detail.',
        command: AICommand.EXPLAIN_CODE,
    },
    [AICommand.REFACTOR_CODE]: {
        name: 'Refactor Code',
        description: 'Suggest code refactoring improvements',
        prefix: 'Act as a refactoring expert. Focus on improving code structure while maintaining functionality.',
        command: AICommand.REFACTOR_CODE,
    },
    [AICommand.ADD_TYPES]: {
        name: 'Add Types',
        description: 'Add TypeScript type annotations',
        prefix: 'Act as a TypeScript expert. Focus on adding appropriate type annotations.',
        command: AICommand.ADD_TYPES,
    },
    [AICommand.ADD_DOCUMENTATION]: {
        name: 'Add Documentation',
        description: 'Add comprehensive code documentation',
        prefix: 'Act as a documentation expert. Focus on adding clear and comprehensive documentation.',
        command: AICommand.ADD_DOCUMENTATION,
    },
    [AICommand.FIX_BUGS]: {
        name: 'Fix Bugs',
        description: 'Identify and fix potential bugs',
        prefix: 'Act as a debugging expert. Focus on identifying and fixing potential bugs.',
        command: AICommand.FIX_BUGS,
    },
    [AICommand.SUGGEST_IMPROVEMENTS]: {
        name: 'Suggest Improvements',
        description: 'Get suggestions for code improvements',
        prefix: 'Act as a code improvement expert. Focus on enhancing code quality and user experience.',
        command: AICommand.SUGGEST_IMPROVEMENTS,
    },
};

function formatMessage(
    command: AICommand,
    params: {
        message?: string;
        files?: AttachedFile[];
        images?: string[];
        codeSelection?: string;
    }
): Message[] {
    const config = COMMAND_CONFIGS[command];
    const messages: Message[] = [
        {
            role: 'system' as Role,
            content: config.prefix ? `${SYSTEM_PROMPT}\n\n${config.prefix}` : SYSTEM_PROMPT,
        },
    ];

    let userMessage = '';

    // Add code selection if available
    if (params.codeSelection) {
        userMessage += `Here's the code:\n\n${params.codeSelection}\n\n`;
    }

    // Add message if available
    if (params.message) {
        userMessage += params.message;
    }

    // Add file attachments if available
    if (params.files?.length) {
        userMessage +=
            '\n\nAttached files:\n' +
            params.files.map((file) => `[${file.name}]:\n${file.content}`).join('\n\n');
    }

    // Add image attachments if available
    if (params.images?.length) {
        userMessage += '\n\nAttached images:\n' + params.images.join('\n');
    }

    messages.push({
        role: 'user' as Role,
        content: userMessage.trim(),
    });

    return messages;
}

export function getPrompts(): Map<AICommand, CommandPrompt> {
    return new Map(
        Object.entries(COMMAND_CONFIGS).map(([command, config]) => [
            command as AICommand,
            createCommandPrompt(config),
        ])
    );
}

export function getPrompt(command: AICommand): CommandPrompt {
    const config = COMMAND_CONFIGS[command];
    if (!config) {
        throw new Error(`No configuration found for command: ${command}`);
    }
    return createCommandPrompt(config);
}

// Helper function to parse code changes from AI response
export function parseCodeChanges(response: string): CodeChange[] {
    const changes: CodeChange[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, 'text/xml');

    const fileNodes = Array.from(doc.getElementsByTagName('file'));
    for (const fileNode of fileNodes) {
        const filePath = fileNode.getAttribute('path') || '';
        const changeNodes = Array.from(fileNode.getElementsByTagName('change'));
        const fileChanges = [];

        for (const changeNode of changeNodes) {
            const type = changeNode.getAttribute('type') as 'insert' | 'delete' | 'replace';
            const startLine = parseInt(changeNode.getAttribute('start_line') || '0', 10);
            const endLine = parseInt(changeNode.getAttribute('end_line') || '0', 10);
            const content = changeNode.textContent || '';

            fileChanges.push({
                type,
                startLine,
                endLine: endLine || startLine,
                content: content.trim(),
            });
        }

        if (fileChanges.length > 0) {
            changes.push({
                file: filePath,
                changes: fileChanges,
            });
        }
    }

    return changes;
}

export { formatMessage };
