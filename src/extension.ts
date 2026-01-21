// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "fav-font-picker" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('fav-font-picker.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Favorite Font Picker!');
	});

	context.subscriptions.push(disposable);

	const pickFontDisposable = vscode.commands.registerCommand('fav-font-picker.pickFont', async () => {
		const favFonts = loadFavFonts();
		if (favFonts.length === 0) {
			vscode.window.showInformationMessage('Please add fonts in "favFontPicker.favFonts" (type: string list) in settings.json, e.g. "favFontPicker.favFonts": ["My Favorite Font"]');
			return;
		}

		const choice = await vscode.window.showQuickPick(favFonts, { title: 'Favorite Font Picker: Apply font', canPickMany: false, });
		if (!choice) {
			return;
		}

		await applyFont(choice);
	});

	context.subscriptions.push(pickFontDisposable);

	const pickFallbackFontDisposable = vscode.commands.registerCommand('fav-font-picker.pickFallbackFont', async () => {
		const favFonts = loadFavFallbackFonts();
		if (favFonts.length === 0) {
			vscode.window.showInformationMessage('Please add fonts in "favFontPicker.favFallbackFonts" (type: string list) in settings.json, e.g. "favFontPicker.favFallbackFonts": ["My Favorite Fallback Font"]');
			return;
		}

		const choice = await vscode.window.showQuickPick(favFonts, { title: 'Favorite Font Picker: Apply fallback font', canPickMany: false, prompt: 'I am prompt' });
		if (!choice) {
			return;
		}

		await applyFallbackFont(choice);
	});

	context.subscriptions.push(pickFallbackFontDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

function loadFavFonts(): string[] {
	return vscode.workspace.getConfiguration('favFontPicker').get<string[]>('favFonts', []);
}

function loadFavFallbackFonts(): string[] {
	return vscode.workspace.getConfiguration('favFontPicker').get<string[]>('favFallbackFonts', []);
}

function loadFontFamilySettings(): string[] {
	return vscode.workspace.getConfiguration('editor').get<string>('fontFamily', '').split(',').map(font => font.trim().replaceAll(/^'|'$/g, ''));
}

async function applyFont(font: string) {
	const fonts = loadFontFamilySettings();
	const newFonts = fonts.length < 2 ? [font] : [font, ...fonts.slice(1)];
	await vscode.workspace.getConfiguration('editor').update('fontFamily', joinFonts(newFonts), vscode.ConfigurationTarget.Global);
}

async function applyFallbackFont(font: string) {
	const fonts = loadFontFamilySettings();
	const newFonts = fonts.length === 0 ? [font] : [fonts[0], font];
	await vscode.workspace.getConfiguration('editor').update('fontFamily', joinFonts(newFonts), vscode.ConfigurationTarget.Global);
}

function joinFonts(fonts: string[]): string {
	return fonts.map(f => `'${f}'`).join(', ');
}