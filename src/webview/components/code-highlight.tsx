interface CodeHighlightProps {
    content: string;
    extension: string;
}

export default function CodeHighlight({ content, extension }: CodeHighlightProps) {
    return <pre className="m-0 whitespace-pre-wrap break-words p-1 text-xs">{content}</pre>;
}
