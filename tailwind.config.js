/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                'vscode-bg': 'var(--vscode-bg)',
                'vscode-bg-secondary': 'var(--vscode-bg-secondary)',
                'vscode-fg': 'var(--vscode-fg)',
                'vscode-input-bg': 'var(--vscode-input-bg)',
                'vscode-input-fg': 'var(--vscode-input-fg)',
                'vscode-border': 'var(--vscode-border)',
                'vscode-border-hover': 'var(--vscode-border-hover)',
                'vscode-button-bg': 'var(--vscode-button-bg)',
                'vscode-button-fg': 'var(--vscode-button-fg)',
                'vscode-button-hover': 'var(--vscode-button-hover)',
                'vscode-list-hover': 'var(--vscode-list-hover)',
                'vscode-list-active': 'var(--vscode-list-active)',
                'vscode-list-active-hover': 'var(--vscode-list-active-hover)',
                'vscode-error-fg': 'var(--vscode-error-fg)',
            },
        },
    },
    plugins: [],
    variants: {
        extend: {
            backgroundColor: ['hover', 'focus', 'active'],
            borderColor: ['hover', 'focus', 'active', 'focus-within'],
            textColor: ['hover', 'focus', 'active'],
            opacity: ['hover', 'focus', 'active', 'group-hover'],
        },
    },
};
