import * as vscode from 'vscode';
import { Language } from '../types/types';
import { pathJoin } from '../util/globals';
import path = require('path');

export abstract class LanguagePackageManager {
    protected abstract name: Language;

    constructor(private readonly editorFileName: string) {}

    getName(): Language {
        return this.name;
    }

    getEditorFileName(): string {
        return this.editorFileName;
    }

    async lockFileContent(): Promise<string> {
        const lockPath: string = pathJoin(path.dirname(this.getEditorFileName()), this.getLockPath());
        const lockFile: vscode.Uri = vscode.Uri.file(lockPath);
        const lockFileContent = await vscode.workspace.fs.readFile(lockFile);

        return lockFileContent.toString();
    }

    getLockPath(): string {
        throw new Error("Not Implemented!");
    }

    async getLinkOfPackage(packageName: string): Promise<string> {
        throw new Error("Not Implemented!");
    }
}
