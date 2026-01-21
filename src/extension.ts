import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const pickFontDisposable = vscode.commands.registerCommand('fav-font-picker.pickFont', async () =>
		await pickFontCommand(
			() => loadFavFonts(),
			'Please add fonts in "favFontPicker.favFonts" (type: string list) in settings.json, e.g. "favFontPicker.favFonts": ["My Favorite Font"]',
			'Favorite Font Picker: Apply font',
			async (font) => await applyFont(font)
		)
	);

	context.subscriptions.push(pickFontDisposable);

	const pickFallbackFontDisposable = vscode.commands.registerCommand('fav-font-picker.pickFallbackFont',
		async () => await pickFontCommand(
			() => loadFavFallbackFonts(),
			'Please add fonts in "favFontPicker.favFallbackFonts" (type: string list) in settings.json, e.g. "favFontPicker.favFallbackFonts": ["My Favorite Fallback Font"]',
			'Favorite Font Picker: Apply fallback font',
			async (font) => await applyFallbackFont(font)
		)
	);

	context.subscriptions.push(pickFallbackFontDisposable);
}

export function deactivate() { }

function loadFavFonts(): string[] {
	return vscode.workspace.getConfiguration('favFontPicker').get<string[]>('favFonts', []);
}

function loadFavFallbackFonts(): string[] {
	return vscode.workspace.getConfiguration('favFontPicker').get<string[]>('favFallbackFonts', []);
}

function loadPreviewFontState(): boolean {
	return vscode.workspace.getConfiguration('favFontPicker').get<boolean>('previewFont', true);
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

async function pickFontCommand(onLoadFavFonts: () => string[], noFavFontsMessage: string, title: string, onApplyFont: (font: string) => Promise<void>) {
	const favFonts = onLoadFavFonts();
	if (favFonts.length === 0) {
		vscode.window.showInformationMessage(noFavFontsMessage);
		return;
	}

	let previewFontTimeout: NodeJS.Timeout | undefined;
	const origFonts = loadFontFamilySettings();
	const enablePreviewFont = loadPreviewFontState();

	const choice = await vscode.window.showQuickPick(
		favFonts,
		{
			title: title,
			canPickMany: false,
			onDidSelectItem: (item) => {
				if (enablePreviewFont && previewFontTimeout) {
					clearTimeout(previewFontTimeout);
				}

				if (typeof item !== 'string') {
					return;
				}

				if (enablePreviewFont) {
					previewFontTimeout = setTimeout(() => onApplyFont(item), 200);
				}
			}
		});

	if (!choice) {
		// Canceled.
		await vscode.workspace.getConfiguration('editor').update('fontFamily', joinFonts(origFonts), vscode.ConfigurationTarget.Global);
		return;
	}

	if (enablePreviewFont) {
		// Restore orig fonts.
		if (previewFontTimeout) {
			clearTimeout(previewFontTimeout);
		}
		await onApplyFont(choice);
	}

	if (!enablePreviewFont) {
		await onApplyFont(choice);
	}
}