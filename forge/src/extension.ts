// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MentorAPIClient } from './mentorAPIClient';
import { MentorService } from './mentorService';
import { MentorViewProvider } from './mentorViewProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log("FORGEMENTOR EXTENSION HOST:", vscode.env.appName);
	console.log('Congratulations, your extension "forge" is now active!');

	// The command has been defined in the package.json file
	const mentorAPIClient = new MentorAPIClient();
	const mentorService = new MentorService(mentorAPIClient);

	const provider = new MentorViewProvider(mentorService, context);

	const disposable1 = vscode.window.registerWebviewViewProvider(
		'forgeMentor.chat',
		provider
	);
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable2 = vscode.commands.registerCommand('forge.askMentor', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('ForgeMentor is ready');
	});

	const disposable3 = vscode.commands.registerCommand(
		'forge.askSelectedCode',
		() => {
			vscode.window.showInformationMessage(
				'ForgeMentor selected-code command executed!'
			);

			console.log('ForgeMentor selected-code command executed');

			const editor = vscode.window.activeTextEditor;

			if (!editor) {
				console.log('No active editor');
				return;
			}

			const selection = editor.selection;

			console.log('Selection:', selection);

			if (selection.isEmpty) {
				vscode.window.showInformationMessage(
					'No code is currently selected.'
				);
				return;
			}

			const selectedCode = editor.document.getText(selection);

			provider.sendSelectedCode(selectedCode);
		}
	);

	context.subscriptions.push(disposable1, disposable2, disposable3);
}

// This method is called when your extension is deactivated
export function deactivate() { }
