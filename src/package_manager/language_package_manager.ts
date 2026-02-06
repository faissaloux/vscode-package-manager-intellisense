import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';
import { Language, Line } from '../types/types';
import { pathJoin, rootPath } from '../util/globals';

export abstract class LanguagePackageManager {
    protected abstract name: Language;
    protected abstract readonly packagePattern: string;
    protected readonly defaultVersion: string = 'n/a';
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

    getLines(document: vscode.TextDocument, packageName: string): Line[] {
        let lines: Line[] = [];
        let lineCount: number = document.lineCount;

        for (let lineNumber: number = 0; lineNumber < lineCount; lineNumber++) {
            let lineText: string = document.lineAt(lineNumber).text;
            const packagePattern: string = this.packagePattern.replace('placeholder', packageName);

            if (lineText.match(new RegExp(packagePattern))) {
                lines.push({content: lineText, package: packageName, lineNumber});
            }
        }

        return lines;
    }
}
