import { useEffect, useState } from "react";
import Message, { type Message as MessageType } from "./Message";

const vscode = acquireVsCodeApi();

function Chat() {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const listener = (event: MessageEvent) => {
            if (event.data.command === "selectedCode") {
                setInput(prev => prev + event.data.code);
            }
        };

        window.addEventListener("message", listener);

        return () => {
            window.removeEventListener("message", listener);
        };
    }, []);
    const handleSubmit = async () => {
        if (!input.trim()) return;

        const userMessage: MessageType = {
            id: Date.now(),
            role: "user",
            content: input,
            timestamp: new Date()
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        const listener = (event: MessageEvent) => {
            if (event.data.command === "messageresponse") {
                const response: MessageType = {
                    id: Date.now() + 1,
                    role: "mentor",
                    content: event.data.text,
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, response]);
                setLoading(false);
                window.removeEventListener("message", listener);
            }
        };
        window.addEventListener("message", listener);
        vscode.postMessage({
            command: "askMentor",
            query: userMessage.content,
        });
    };

    return (
        <div className="chat-container">
            <div className="messages-list">
                {messages.map((msg) => (
                    <Message key={msg.id} message={msg} />
                ))}
                {loading && (
                    <div className="message-wrapper message-wrapper--assistant">
                        <div className="message-avatar message-avatar--assistant">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" />
                            </svg>
                        </div>
                        <div className="message-bubble-group">
                            <span className="message-role-label message-role-label--assistant">ForgeMentor</span>
                            <div className="message-bubble message-bubble--assistant">
                                <div className="loading-dots">
                                    <div className="loading-dot"></div>
                                    <div className="loading-dot"></div>
                                    <div className="loading-dot"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Ask anything..."
                    disabled={loading}
                />
                <button onClick={handleSubmit} disabled={loading || !input.trim()}>
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chat;