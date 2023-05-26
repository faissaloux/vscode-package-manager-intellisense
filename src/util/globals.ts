import path = require('path');
import * as vscode from 'vscode';

export const decorationType = vscode.window.createTextEditorDecorationType({
    color: 'grey',
});

export const pathJoin = (...parts: string[]): string => parts.join(path.sep);
