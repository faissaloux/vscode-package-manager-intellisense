import * as vscode from 'vscode';
import * as globals from './util/globals';
import { Decorator } from './decorator/decorator';
import { PackageManager } from './package_manager/package_manager';

function supportedOpenEditors(): vscode.TextEditor[] {
	const packagesFiles = ['package.json'];

	if (vscode.workspace.getConfiguration().get('package-manager-intellisense.composer.enable')) {
		packagesFiles.push('composer.json');
	}

	if (vscode.workspace.getConfiguration().get('package-manager-intellisense.bundler.enable')) {
		packagesFiles.push('Gemfile');
	}

	return vscode.window.visibleTextEditors.filter(
		editor => globals.endsWithAny(packagesFiles, editor.document.fileName)
	);
}

function decorate(): void {
	const openEditors = supportedOpenEditors();

	if (openEditors.length) {
		for (const openEditor of openEditors) {
			const packageManager = new PackageManager(openEditor).get();
			new Decorator(openEditor, packageManager).decorate();
		}
	}
}

function clearDecoration(): void {
	vscode.window.visibleTextEditors.forEach(textEditor => {
		textEditor.setDecorations(globals.decorationType, []);
	});
}

export function activate(context: vscode.ExtensionContext) {
	decorate();

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
