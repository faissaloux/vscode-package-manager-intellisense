import * as vscode from 'vscode';
import * as fs from 'fs';
import { pathJoin } from '../../../util/globals';

export default abstract class JavascriptPackageManager {
    protected abstract readonly locks: string[];
    protected abstract readonly startsWith: {[version: string | number]: string}|string;
    protected lockVersion: number = 0;

    setLockVersion(version: number): void {
        this.lockVersion = version;
    }

    getLockPath(): string {
        for (const lockFile of this.locks) {
            const rootPath = (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
                ? vscode.workspace.workspaceFolders[0].uri.fsPath
                : '';

            const lockPath: string = pathJoin(rootPath, lockFile);

            if (fs.existsSync(lockPath)) {
                return lockFile;
            }
        };

        return '';
    }

    lockPackageStartsWith(packageName: string, version: string): string {
        const pattern =  this.startsWith;

        if (typeof pattern === 'object' && this.lockVersion) {
            const lockVersion = Number(this.lockVersion);

            if (pattern[lockVersion]) {
                return pattern[lockVersion].replace('packageName', packageName).replace('version', version);
            }

            let lastVersion = Object.keys(pattern).sort().at(0);

            if (lastVersion !== undefined) {
                for (const version of Object.keys(pattern).sort()) {
                    if (Number(version) > lockVersion ) {
                        return pattern[lastVersion].replace('packageName', packageName).replace('version', version);
                    }

                    lastVersion = version;
                }

                return pattern[lastVersion].replace('packageName', packageName).replace('version', version);
            }
        }

        return (pattern as string).replace('packageName', packageName).replace('version', version);
    }
}