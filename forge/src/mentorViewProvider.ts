import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { MentorService } from './mentorService';

export class MentorViewProvider implements vscode.WebviewViewProvider {
    private webviewView?: vscode.WebviewView;

    constructor(
        private readonly mentorService: MentorService,
        private readonly context: vscode.ExtensionContext
    ) { }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): Thenable<void> | void {
        this.webviewView = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this._getReactHtml(webviewView.webview);


        webviewView.webview.onDidReceiveMessage(async message => {

            if (message.command === 'askMentor') {
                try {

                    const response = await this.mentorService.askMentor(message.query, 'gemini');
                    webviewView.webview.postMessage({ command: 'messageresponse', text: response });
                } catch (err) {
                    const errorMessage = (err instanceof Error) ? err.message : "Error";
                    console.error("Error: ", errorMessage);
                    webviewView.webview.postMessage({ command: 'messageresponse', text: "Error: " + errorMessage });
                }
            } else if (message.command === 'giveHint') {
                try {

                    const response = await this.mentorService.giveHint(message.query, 'gemini');
                    webviewView.webview.postMessage({ command: 'hintresponse', text: response });
                } catch (err) {
                    const errorMessage = (err instanceof Error) ? err.message : "Error";
                    console.error("Error: ", errorMessage);
                    webviewView.webview.postMessage({ command: 'hintresponse', text: "Error: " + errorMessage });
                }
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
