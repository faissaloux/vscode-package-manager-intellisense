import * as vscode from 'vscode';
import * as globals from './util/globals';
import { Decorator } from './decorator/decorator';
import { PackageManager } from './package_manager/package_manager';

export function activate(context: vscode.ExtensionContext) {
	vscode.workspace.onDidOpenTextDocument(() => {
		const openEditor = vscode.window.visibleTextEditors.filter(
			editor => editor.document.fileName.endsWith('package.json')
				|| editor.document.fileName.endsWith('composer.json')
		);

		if (openEditor.length) {
			const packageManager = new PackageManager(openEditor[0]).get();
			new Decorator(openEditor[0], packageManager).decorate();
		}
	});

	vscode.workspace.onDidChangeTextDocument(() => {
		const openEditor = vscode.window.visibleTextEditors.filter(
			editor => editor.document.fileName.endsWith('package.json')
				|| editor.document.fileName.endsWith('composer.json')
		);

		if (openEditor.length) {
			vscode.window.visibleTextEditors.forEach(textEditor => {
				textEditor.setDecorations(globals.decorationType, []);
			});
		}
	});

	vscode.workspace.onWillSaveTextDocument(() => {
		const openEditor = vscode.window.visibleTextEditors.filter(
			editor => editor.document.fileName.endsWith('package.json')
				|| editor.document.fileName.endsWith('composer.json')
		);

		if (openEditor.length) {
			const packageManager = new PackageManager(openEditor[0]).get();
			new Decorator(openEditor[0], packageManager).decorate();
		}
	});
}

export function deactivate() {
	vscode.window.visibleTextEditors.forEach(textEditor => {
        textEditor.setDecorations(globals.decorationType, []);
    });
}
