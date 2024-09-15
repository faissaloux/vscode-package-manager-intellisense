import * as vscode from 'vscode';

export class LanguagePackageManager {
    constructor(protected rootPath: string) {}

    async lockFileContent(): Promise<string> {
        const lockPath = await this.getLockPath();
        const lockFile = vscode.Uri.file(lockPath);
        const lockFileContent = await vscode.workspace.fs.readFile(lockFile);

        return lockFileContent.toString();
    }

    getLockPath(): string {
        throw new Error("Not Implemented!");
    }
}
