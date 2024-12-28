import { BotMessageSquareIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useChatContext } from '../contexts/chat-context';

export const ChatNotification: React.FC = () => {
    const { currentSession, currentSessionId } = useChatContext();
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (currentSession) {
            const displayTitle =
                currentSession.title.length > 21
                    ? currentSession.title.substring(0, 18) + '...'
                    : currentSession.title;

            const isNewChat = Date.now() - new Date(currentSession.createdAt).getTime() < 2000;
            setMessage(
                isNewChat ? 'Started new chat' : `Switched to ${displayTitle || 'another chat.'}`
            );

            setShow(true);
            const timer = setTimeout(() => setShow(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [currentSessionId]);

    if (!show) return null;

    return (
        <div className="fixed left-0 right-0 top-1 z-50 flex justify-center">
            <div className="animate-slideInOut rounded-md bg-vscode-button-bg px-4 py-2 text-vscode-button-fg">
                <span className="flex items-center gap-2 text-sm">
                    <BotMessageSquareIcon size={14} />
                    {message}
                </span>
            </div>
        </div>
    );
};
