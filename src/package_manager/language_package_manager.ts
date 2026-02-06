import * as vscode from 'vscode';
import * as cp from 'child_process';
import { Language } from '../types/types';
import { pathJoin, rootPath } from '../util/globals';
import * as path from 'path';

export abstract class LanguagePackageManager {
    protected abstract name: Language;
    protected readonly outdatedPackagesCommand: string = '';

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

    getOutdatedPackages(): string {
        let outdatedResponse: string;
        try {
            outdatedResponse = cp.execSync(this.outdatedPackagesCommand, {
                cwd: rootPath,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
        } catch (err: any) {
            if (err.stdout) {
                outdatedResponse = err.stdout.toString();
            } else {
                return '';
            }
        }

        return outdatedResponse;
    }
}
