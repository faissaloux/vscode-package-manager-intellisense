import * as vscode from 'vscode';
import * as globals from './util/globals';
import { Decorator } from './decorator/decorator';
import { PackageManager } from './package_manager/package_manager';
import { Config } from './config';

function supportedOpenEditors(): vscode.TextEditor[] {
	return vscode.window.visibleTextEditors.filter(
		editor => globals.endsWithAny(Config.enabledPackageManagers(), editor.document.fileName)
	);
}

function decorate(): void {
	const openEditors = supportedOpenEditors();

	if (openEditors.length) {
		for (const openEditor of openEditors) {
			const packageManager = new PackageManager(openEditor).get();

			if (packageManager) {
				new Decorator(openEditor, packageManager).decorate();
			}
		}
	}
}

function clearDecoration(): void {
	vscode.window.visibleTextEditors.forEach(textEditor => {
		textEditor.setDecorations(globals.decorationType, []);
		textEditor.setDecorations(globals.latestVersionDecoration, []);
	});
}

export function activate(context: vscode.ExtensionContext) {
	decorate();

	context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(() => setTimeout(() => decorate(), 100)));
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => decorate()));
	context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(() => decorate()));
}

export function deactivate() {
	clearDecoration();
}
