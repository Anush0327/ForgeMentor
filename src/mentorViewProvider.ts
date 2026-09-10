
import * as vscode from 'vscode';

export class MentorViewProvider implements vscode.WebviewViewProvider {
    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ): Thenable<void> | void {

        // Enable JS so the button can send messages
        webviewView.webview.options = { enableScripts: true };

        webviewView.webview.html = this._getHtml();

        // Handle messages sent from the webview
        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === 'askMentor') {
                if (message.text === "who is using the chat") {
                    webviewView.webview.postMessage({ command: 'messageresponse', text: 'Anush is using the application' });
                }

            }
        });



    }

    private _getHtml(): string {
        return /*html*/ `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>ForgeMentor</title>
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                        margin: 0;
                        padding: 0;
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                        background: var(--vscode-editor-background);
                    }
                    #chatContainer {
                        flex: 1;
                        overflow-y: auto;
                        padding: 12px;
                    }
                    .message {
                        margin-bottom: 12px;
                        max-width: 90%;
                        padding: 8px 12px;
                        border-radius: 8px;
                        line-height: 1.4;
                        word-break: break-word;
                    }
                    .user {
                        background: var(--vscode-input-background);
                        align-self: flex-end;
                    }
                    .bot {
                        background: var(--vscode-sideBar-background);
                        align-self: flex-start;
                    }
                    #inputForm {
                        display: flex;
                        padding: 8px;
                        border-top: 1px solid var(--vscode-panel-border);
                        background: var(--vscode-editorWidget-background);
                    }
                    #askInput {
                        flex: 1;
                        resize: none;
                        padding: 6px;
                        font-size: 0.9em;
                    }
                    #sendBtn {
                        margin-left: 6px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 6px 12px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    #sendBtn:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                </style>
            </head>
            <body>
                <div id="chatContainer"></div>
                <form id="inputForm">
                    <textarea id="askInput" placeholder="Ask anything..." rows="2"></textarea>
                    <button id="sendBtn" type="submit">Send</button>
                </form>
                <script>
                    const vscode = acquireVsCodeApi();
                    const chatContainer = document.getElementById('chatContainer');
                    function addMessage(text, className) {
                        const msg = document.createElement('div');
                        msg.className = 'message ' + className;
                        msg.innerText = text;
                        chatContainer.appendChild(msg);
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }
                    document.getElementById('inputForm').addEventListener('submit', (e) => {
                        e.preventDefault();
                        const input = document.getElementById('askInput');
                        const question = input.value.trim();
                        if (!question) return;
                        addMessage(question, 'user');
                        input.value = '';
                        vscode.postMessage({ command: 'askMentor', text: question });
                    });
                    window.addEventListener('message', event => {
                        const data = event.data;
                        if (data.command === 'messageresponse') {
                            addMessage(data.text, 'bot');
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
}