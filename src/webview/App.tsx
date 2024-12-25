import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from './types';
import { Header } from './components/header';
import { MessageList } from './components/message-list';
import { MessageInput } from './components/message-input';

export const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            text: 'Hello! I am your VS Code AI assistant. How can I help you today?',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleInputChange = useCallback((text: string) => {
        setInputText(text);
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!inputText.trim()) return;

            const userMessage: Message = {
                text: inputText,
                sender: 'user',
                timestamp: new Date().toLocaleTimeString(),
            };

            setMessages((prev) => [...prev, userMessage]);
            setInputText('');
            setIsTyping(true);

            // Simulated AI response
            setTimeout(() => {
                const aiResponse: Message = {
                    text: 'This is a sample response. Real AI integration will be added later.',
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString(),
                };
                setMessages((prev) => [...prev, aiResponse]);
                setIsTyping(false);
            }, 1500);
        },
        [inputText]
    );

    return (
        <div className="flex h-screen flex-col">
            
            <div className="min-h-0 flex-1 overflow-y-auto">
                <Header />
                <MessageList
                    messages={messages}
                    isTyping={isTyping}
                    messagesEndRef={messagesEndRef}
                />
            </div>
            <div className="bg-vscode-bg border-vscode-border flex-none border-t p-4">
                <MessageInput
                    inputText={inputText}
                    isTyping={isTyping}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    );
};
