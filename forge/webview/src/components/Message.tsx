export type MessageRole = "user" | "mentor";

export interface Message {
    id: number
    role: MessageRole;
    content: string;
    timestamp?: Date;
}

interface MessageProps {
    message: Message;
}

function formatTime(date?: Date): string {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Message({ message }: MessageProps) {
    const isUser = message.role === "user";

    return (
        <div
            className={`message-wrapper ${isUser ? "message-wrapper--user" : "message-wrapper--assistant"}`}
        >
            {/* Avatar */}
            <div className={`message-avatar ${isUser ? "message-avatar--user" : "message-avatar--assistant"}`}>
                {isUser ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" />
                    </svg>
                )}
            </div>

            {/* Bubble */}
            <div className="message-bubble-group">
                <span className={`message-role-label ${isUser ? "message-role-label--user" : "message-role-label--assistant"}`}>
                    {isUser ? "You" : "ForgeMentor"}
                </span>
                <div className={`message-bubble ${isUser ? "message-bubble--user" : "message-bubble--assistant"}`}>
                    <p className="message-content">{message.content}</p>
                </div>
                {message.timestamp && (
                    <span className="message-timestamp">{formatTime(message.timestamp)}</span>
                )}
            </div>
        </div>
    );
}

export default Message;
