import * as cp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import type { Language, Line } from '../types/types';
import { pathJoin, rootPath } from '../util/globals';

export abstract class LanguagePackageManager {
    protected abstract name: Language;
    protected abstract readonly packagePattern: string;
    protected readonly defaultVersion: string = 'n/a';
    protected readonly outdatedPackagesCommand: string = '';
    protected readonly excluded: string[] = [];

    constructor(private readonly editorFileName: string) {}

    getName(): Language {
        return this.name;
    }

    getEditorFileName(): string {
        return this.editorFileName;
    }

    isExcluded(packageName: string): boolean {
        return this.excluded.includes(packageName);
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

    async getLinkOfPackage(_packageName: string): Promise<string> {
        return '';
    }

    getOutdatedPackages(): string {
        let outdatedResponse: string;
        try {
            outdatedResponse = cp.execSync(this.outdatedPackagesCommand, {
                cwd: rootPath,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
        } catch (error: any) {
            if (error.stdout) {
                outdatedResponse = error.stdout.toString();
            } else {
                return '';
            }
        }

        return outdatedResponse;
    }

    getLines(document: vscode.TextDocument, packageName: string): Line[] {
        const lines: Line[] = [];
        const lineCount: number = document.lineCount;

        for (let lineNumber: number = 0; lineNumber < lineCount; lineNumber++) {
            const lineText: string = document.lineAt(lineNumber).text;
            const packagePattern: string = this.packagePattern.replace('placeholder', packageName);

            if (lineText.match(new RegExp(packagePattern)) && lineText.match(/:\s*".?\d+(\.\d+){0,2}"/)) {
                lines.push({content: lineText, package: packageName, lineNumber});
            }
        }

        return lines;
    }
}
