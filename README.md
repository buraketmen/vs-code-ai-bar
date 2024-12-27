# AI Assistant Extension for VS Code

An AI assistant extension example for Visual Studio Code that provides a chat interface in a bar.

It's built with React, TailwindCSS, TypeScript, Webpack, and VS Code Webview API.

![Preview](https://github.com/buraketmen/vs-code-ai-bar/blob/main/external/base.png)

## Features

- [x] Modern and user-friendly tech stack
- [x] Seamless integration with VS Code theme colors
- [x] Easy access with keyboard shortcut `CMD + SHIFT + J`
- [x] Chat history
- [x] Undo & Redo Chat deletion
- [x] Select file from workspace and use it in chat
- [x] Sync workspace files with chat
- [x] Copy code from editor to chat
- [x] Extension configuration
- [ ] Real-time chat experience
- [ ] Integration with LLM providers
- [ ] Customizable prompts, executing prompt using selected code
- [ ] Testing with Jest and React Testing Library
- [ ] CI/CD with GitHub Actions

## Development

1. Clone the repository
2. Run `npm install`
3. Open VS Code and press `F5` to start debugging
4. Accept the dialog to debug the extension
5. Press `CMD + SHIFT + J` to open the "AI" Assistant
6. Press `CMD + R` to reload the extension (if you make changes to the code)

## Packaging

```bash
npm run package
npm install -g @vscode/vsce
vsce package --allow-missing-repository
```

## License

MIT
