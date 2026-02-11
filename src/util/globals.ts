import * as path from 'path';
import * as vscode from 'vscode';

export const decorationType = vscode.window.createTextEditorDecorationType({
    color: 'grey',
});

export const latestVersionDecoration = vscode.window.createTextEditorDecorationType({
    color: '#F56747',
});

export const pathJoin = (...parts: string[]): string => parts.join(path.sep);

export const endsWithAny = (options: string[], string: string): boolean => options.some((option: string) => string.endsWith(option));

export const rootPath: string|undefined = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined;
