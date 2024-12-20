import path = require('path');
import * as vscode from 'vscode';

export const decorationType = vscode.window.createTextEditorDecorationType({
    color: 'grey',
});

export const pathJoin = (...parts: string[]): string => parts.join(path.sep);

export const endsWithAny = (options: string[], string: string): boolean => options.some((option: string) => string.endsWith(option));
