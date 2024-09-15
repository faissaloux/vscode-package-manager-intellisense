import * as vscode from 'vscode';
import * as globals from './util/globals';
import { Decorator } from './decorator/decorator';
import { PackageManager } from './package_manager/package_manager';

function supportedOpenEditors(): vscode.TextEditor[] {
	return vscode.window.visibleTextEditors.filter(
		editor => editor.document.fileName.endsWith('package.json')
			|| editor.document.fileName.endsWith('composer.json')
			|| editor.document.fileName.endsWith('Gemfile')
	);
}

function decorate(): void {
	const openEditors = supportedOpenEditors();

	if (openEditors.length) {
		const packageManager = new PackageManager(openEditors[0]).get();
		new Decorator(openEditors[0], packageManager).decorate();
	}
}

function clearDecoration(): void {
	vscode.window.visibleTextEditors.forEach(textEditor => {
		textEditor.setDecorations(globals.decorationType, []);
	});
}

export function activate(context: vscode.ExtensionContext) {
	vscode.workspace.onDidOpenTextDocument(() => decorate());

	vscode.workspace.onDidChangeTextDocument(() => {
		const openEditors = supportedOpenEditors();

		if (openEditors.length) {
			clearDecoration();
		}
	});

	vscode.workspace.onWillSaveTextDocument(() => decorate());
}

export function deactivate() {
	clearDecoration();
}
