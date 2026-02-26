import * as globals from './util/globals';
import * as vscode from 'vscode';
import { Config } from './config';
import { Decorator } from './decorator/decorator';
import { PackageManager } from './package_manager/package_manager';

const supportedOpenEditors = (): vscode.TextEditor[] => vscode.window.visibleTextEditors.filter(
	editor => globals.endsWithAny(Config.enabledPackageManagers(), editor.document.fileName)
);

const decorate = (): void => {
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

const clearDecoration = (): void => {
	vscode.window.visibleTextEditors.forEach(textEditor => {
		textEditor.setDecorations(globals.decorationType, []);
		textEditor.setDecorations(globals.latestVersionDecoration, []);
	});
}

export const activate = (context: vscode.ExtensionContext) => {
	decorate();

	context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(() => setTimeout(() => decorate(), 100)));
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => decorate()));
	context.subscriptions.push(vscode.workspace.onWillSaveTextDocument(() => decorate()));
}

export const deactivate = () => {
	clearDecoration();
}
