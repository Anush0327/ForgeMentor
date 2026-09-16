
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { MentorService } from './mentorService';
import { text } from 'stream/consumers';

export class MentorViewProvider implements vscode.WebviewViewProvider {

    private mentorService: MentorService;

    private context: vscode.ExtensionContext;

    constructor(
        mentorService: MentorService,
        context: vscode.ExtensionContext
    ) {
        this.mentorService = mentorService;
        this.context = context;
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ): Thenable<void> | void {

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
            }
        });



    }

    private _getReactHtml(webview: vscode.Webview): string {

        const distPath = path.join(
            this.context.extensionPath,
            'webview',
            'dist'
        );

        const indexHtmlPath = path.join(distPath, 'index.html');

        if (!fs.existsSync(indexHtmlPath)) {
            return `
            <!DOCTYPE html>
            <html>
            <body>
                <h1>React app not found</h1>
            </body>
            </html>
        `;
        }

        let html = fs.readFileSync(indexHtmlPath, 'utf8');

        const assetsUri = webview.asWebviewUri(
            vscode.Uri.file(path.join(distPath, 'assets'))
        );

        html = html.replace(
            /\.\/assets\//g,
            `${assetsUri.toString()}/`
        );

        return html;
    }
}