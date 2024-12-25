# AI Assistant Extension for VS Code

An AI assistant extension example for Visual Studio Code that provides a chat interface in a bar.

It's built with React, TailwindCSS, TypeScript, Webpack, and VS Code Webview API.

It's a fork of [AI Assistant for VS Code](https://github.com/microsoft/vscode-extension-samples/tree/main/ai-assistant-sample)

![Preview](https://github.com/buraketmen/vs-code-ai-bar/blob/main/external/base.png)

## Features



- [X] Modern and user-friendly tech stack
- [X] Seamless integration with VS Code theme colors
- [X] Easy access with keyboard shortcut (CTRL + SHIFT + J)
- [ ] Real-time chat experience
- [ ] Integration with LLM providers
- [ ] Customizable prompts, executing prompt using selected code
- [ ] Testing with Jest and React Testing Library
- [ ] CI/CD with GitHub Actions
- [ ] Shadcn ui components (Optional)

## Development

1. Clone the repository
2. Run `npm install`
3. Open VS Code and press F5 to start debugging
4. Accept the dialog to debug the extension
5. Press CTRL + SHIFT + J to open the "AI" Assistant
6. Press CTRL + R to reload the extension (if you make changes to the code)

# Packaging

```bash
npm run package
npm install -g @vscode/vsce
vsce package --allow-missing-repository
```

## License

MIT