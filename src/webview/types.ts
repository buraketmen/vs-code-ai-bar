export interface Message {
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
}
