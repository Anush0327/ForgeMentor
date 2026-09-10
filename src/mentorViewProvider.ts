import { text } from 'stream/consumers';
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
                        padding: 12px;
                        margin: 0;
                    }
                    h1 { font-size: 1.2em; margin-bottom: 4px; }
                    p  { font-size: 0.9em; opacity: 0.8; margin-bottom: 16px; }
                    button {
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.9em;
                        width: 100%;
                    }
                    button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                </style>
            </head>
            <body>
                <h1>Welcome to ForgeMentor</h1>
                <p>This is your AI Engineering mentor</p>
                <div id="usermessage"></div>
                <div id="botmessage"></div>
                <form id="askForm">
                    <textarea id="askInput" placeholder="Ask anything..."
                    style="width:100%;height:100px;margin-bottom:8px;" 
                    ></textarea>
                    <button type="submit">Ask Forge</button>
                </form>
                
                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('askForm').addEventListener('submit', (event) => {
                        event.preventDefault();
                        const question = document.getElementById('askInput').value;
                        document.getElementById('usermessage').innerText = question;
                        vscode.postMessage({ command: 'askMentor', text: question });
                    });
                    window.addEventListener('message', event => {
                        switch(event.data.command) {
                            case 'messageresponse':
                                document.getElementById('botmessage').innerText = event.data.text;
                                break;
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
}