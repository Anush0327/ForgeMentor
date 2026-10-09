import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { MentorService } from './mentorService';

export class MentorViewProvider implements vscode.WebviewViewProvider {
    private webviewView?: vscode.WebviewView;

    constructor(
        private readonly mentorService: MentorService,
        private readonly context: vscode.ExtensionContext
    ) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): Thenable<void> | void {
        this.webviewView = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this._getReactHtml(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (message: { command?: string; query?: string }) => {
            if (typeof message.query !== 'string') {
                return;
            }

            try {
                let response: string;
                let responseCommand: string;

                switch (message.command) {
                    case 'askMentor':
                        response = await this.mentorService.askMentor(message.query, 'gemini');
                        responseCommand = 'messageresponse';
                        break;
                    case 'giveHint':
                        response = await this.mentorService.giveHint(message.query, 'gemini');
                        responseCommand = 'hintresponse';
                        break;
                    case 'explainCode':
                        response = await this.mentorService.explainCode(message.query, 'gemini');
                        responseCommand = 'explanationresponse';
                        break;
                    default:
                        return;
                }

                webviewView.webview.postMessage({ command: responseCommand, text: response });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
                console.error(`ForgeMentor request failed (${message.command ?? 'unknown'}):`, errorMessage);

                const responseCommand = message.command === 'giveHint'
                    ? 'hintresponse'
                    : message.command === 'explainCode'
                        ? 'explanationresponse'
                        : 'messageresponse';

                webviewView.webview.postMessage({
                    command: responseCommand,
                    text: `I couldn't complete that request. ${errorMessage}`,
                });
            }
        });
    }

    public sendSelectedCode(code: string) {
        this.webviewView?.webview.postMessage({ command: 'selectedCode', code });
    }

    private _getReactHtml(webview: vscode.Webview): string {
        const distPath = path.join(this.context.extensionPath, 'webview', 'dist');
        const indexHtmlPath = path.join(distPath, 'index.html');

        if (!fs.existsSync(indexHtmlPath)) {
            return `
                <!DOCTYPE html>
                <html>
                <body>
                    <h1>ForgeMentor webview not found</h1>
                    <p>Build the frontend with <code>npm run build</code> in the webview directory.</p>
                </body>
                </html>
            `;
        }

        let html = fs.readFileSync(indexHtmlPath, 'utf8');
        const assetsUri = webview.asWebviewUri(
            vscode.Uri.file(path.join(distPath, 'assets'))
        );

        html = html.replace(/\.\/assets\//g, `${assetsUri.toString()}/`);
        return html;
    }
}
