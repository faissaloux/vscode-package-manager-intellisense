import * as vscode from 'vscode';
import * as globals from './util/globals';
import { Decorator } from './decorator/decorator';

export function activate(context: vscode.ExtensionContext) {
	vscode.workspace.onDidOpenTextDocument(() => {
		const openEditor = vscode.window.visibleTextEditors.filter(
			editor => editor.document.fileName.endsWith('package.json')
		);

		if (openEditor.length) {
			new Decorator(openEditor[0]).decorate();
		}
	});
}

export function deactivate() {
	vscode.window.visibleTextEditors.forEach(textEditor => {
        textEditor.setDecorations(globals.decorationType, []);
    });
}
