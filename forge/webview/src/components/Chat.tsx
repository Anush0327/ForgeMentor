import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Message, { type Message as MessageType } from "./Message";
import "./Chat.css";

const vscode = acquireVsCodeApi();

type MentorCommand = "askMentor" | "giveHint" | "explainCode";

type WebviewMessage = {
    command?: string;
    text?: string;
    code?: string;
};

const responseCommands = new Set([
    "messageresponse",
    "hintresponse",
    "explanationresponse",
]);

function Chat() {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [input, setInput] = useState("");
    const [selectedCode, setSelectedCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeAction, setActiveAction] = useState<MentorCommand | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const canAct = Boolean(input.trim() || selectedCode.trim());

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, loading]);

    useEffect(() => {
        const listener = (event: MessageEvent<WebviewMessage>) => {
            const data = event.data;
            if (!data?.command) return;

            if (data.command === "selectedCode") {
                setSelectedCode(data.code ?? "");
                return;
            }

            if (responseCommands.has(data.command)) {
                const response: MessageType = {
                    id: Date.now(),
                    role: "mentor",
                    content: data.text ?? "ForgeMentor returned an empty response.",
                    timestamp: new Date(),
                };

                setMessages((previous) => [...previous, response]);
                setLoading(false);
                setActiveAction(null);
            }
        };

        window.addEventListener("message", listener);
        return () => window.removeEventListener("message", listener);
    }, []);

    const handleAction = (command: MentorCommand) => {
        if (!canAct || loading) return;

        const prompt = input.trim() || (
            command === "giveHint"
                ? "Give me a hint for the selected code without revealing the full solution."
                : command === "explainCode"
                    ? "Explain the selected code step by step."
                    : "Help me understand or improve the selected code."
        );

        const query = selectedCode
            ? `${prompt}\n\nSelected code:\n\`\`\`\n${selectedCode}\n\`\`\``
            : prompt;

        const userMessage: MessageType = {
            id: Date.now(),
            role: "user",
            content: selectedCode ? `${prompt}\n\n[Selected code attached]` : prompt,
            timestamp: new Date(),
        };

        setMessages((previous) => [...previous, userMessage]);
        setInput("");
        setLoading(true);
        setActiveAction(command);

        vscode.postMessage({ command, query });
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleAction("askMentor");
        }
    };

    const focusComposer = () => inputRef.current?.focus();

    return (
        <div className="chat-container">
            <header className="chat-header">
                <div className="brand-mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                        <path d="M8.2 4.5 3 12l5.2 7.5M15.8 4.5 21 12l-5.2 7.5M14 3l-4 18"
                            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="chat-brand-copy">
                    <h1>ForgeMentor</h1>
                    <p>Your AI engineering mentor</p>
                </div>
                <span className="status-indicator" title="Ready to help">
                    <span />
                    Ready
                </span>
            </header>

            <div className="messages-list">
                {messages.length === 0 && !loading && (
                    <section className="empty-state">
                        <div className="empty-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" width="30" height="30">
                                <path d="M12 3a7 7 0 0 0-4.5 12.36V18h9v-2.64A7 7 0 0 0 12 3Z"
                                    stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                                <path d="M9.5 21h5M9 18h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                        </div>
                        <p className="eyebrow">BUILD YOUR UNDERSTANDING</p>
                        <h2>What are we working on?</h2>
                        <p className="empty-desc">
                            Ask an engineering question, get a nudge in the right direction,
                            or break down code one step at a time.
                        </p>

                        <div className="starter-cards">
                            <button className="starter-card" type="button" onClick={() => {
                                setInput("Help me reason through this problem without giving away the full solution.");
                                focusComposer();
                            }}>
                                <span className="starter-icon hint-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                                        <path d="M9 18h6M10 22h4M15.1 14c.2-1 .7-1.7 1.4-2.5A4.7 4.7 0 0 0 18 8a6 6 0 0 0-12 0c0 1 .2 2.2 1.5 3.5A4.6 4.6 0 0 1 8.9 14"
                                            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                                    </svg>
                                </span>
                                <span className="starter-copy">
                                    <strong>Give me a hint</strong>
                                    <small>Find the next step, not the whole answer.</small>
                                </span>
                                <span className="starter-arrow" aria-hidden="true">↗</span>
                            </button>
                            <button className="starter-card" type="button" onClick={() => {
                                if (selectedCode) {
                                    handleAction("explainCode");
                                } else {
                                    setInput("Explain this code step by step:\n");
                                    focusComposer();
                                }
                            }}>
                                <span className="starter-icon explain-icon" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                                        <path d="m8 17-5-5 5-5M16 7l5 5-5 5M14 4l-4 16"
                                            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <span className="starter-copy">
                                    <strong>Explain my code</strong>
                                    <small>Understand selected code line by line.</small>
                                </span>
                                <span className="starter-arrow" aria-hidden="true">↗</span>
                            </button>
                        </div>
                    </section>
                )}

                {messages.map((message) => (
                    <Message key={message.id} message={message} />
                ))}

                {loading && (
                    <div className="message-wrapper message-wrapper--assistant">
                        <div className="message-avatar message-avatar--assistant" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" />
                            </svg>
                        </div>
                        <div className="message-bubble-group">
                            <span className="message-role-label message-role-label--assistant">
                                ForgeMentor{activeAction === "giveHint" ? " · thinking of a hint" : activeAction === "explainCode" ? " · reading your code" : ""}
                            </span>
                            <div className="message-bubble message-bubble--assistant">
                                <div className="loading-dots" role="status" aria-label="ForgeMentor is responding">
                                    <div className="loading-dot" />
                                    <div className="loading-dot" />
                                    <div className="loading-dot" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="input-area chat-composer">
                {selectedCode && (
                    <div className="selected-code-chip">
                        <span className="selected-code-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                                <path d="m8 17-5-5 5-5M16 7l5 5-5 5M14 4l-4 16"
                                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span className="selected-code-copy">
                            <strong>Editor selection attached</strong>
                            <small>{selectedCode.split("\n").length} line{selectedCode.split("\n").length === 1 ? "" : "s"} of code</small>
                        </span>
                        <button
                            className="clear-selection"
                            type="button"
                            onClick={() => setSelectedCode("")}
                            aria-label="Remove selected code context"
                            title="Remove selected code"
                            disabled={loading}
                        >×</button>
                    </div>
                )}

                <div className="composer-box">
                    <textarea
                        ref={inputRef}
                        className="chat-textarea"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedCode ? "Ask a question about the selected code…" : "Ask an engineering question…"}
                        disabled={loading}
                        rows={3}
                        aria-label="Message ForgeMentor"
                    />
                    <div className="composer-toolbar">
                        <span className="composer-tip">
                            <kbd>Enter</kbd> to send <span>·</span> <kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line
                        </span>
                        <div className="input-actions">
                            <button
                                type="button"
                                className="btn-action btn-hint"
                                onClick={() => handleAction("giveHint")}
                                disabled={loading || !canAct}
                                title="Get guidance without the complete solution"
                            >
                                <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                                    <path d="M9 18h6M10 22h4M15.1 14c.2-1 .7-1.7 1.4-2.5A4.7 4.7 0 0 0 18 8a6 6 0 0 0-12 0c0 1 .2 2.2 1.5 3.5A4.6 4.6 0 0 1 8.9 14"
                                        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                                </svg>
                                <span>Give Hint</span>
                            </button>
                            <button
                                type="button"
                                className="btn-action btn-explain"
                                onClick={() => handleAction("explainCode")}
                                disabled={loading || !canAct}
                                title="Explain the selected code or the code in your message"
                            >
                                <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
                                    <path d="m8 17-5-5 5-5M16 7l5 5-5 5M14 4l-4 16"
                                        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Explain Code</span>
                            </button>
                            <button
                                type="button"
                                className="btn-send"
                                onClick={() => handleAction("askMentor")}
                                disabled={loading || !canAct}
                                title="Send message to ForgeMentor"
                            >
                                <span>{loading ? "Working…" : "Send"}</span>
                                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Chat;
