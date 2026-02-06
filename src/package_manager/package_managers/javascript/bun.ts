import * as vscode from 'vscode';
import * as cp from 'child_process';
import { JavascriptPackageManagerInterface } from "../../../interfaces/javascript_package_manager";
import { outdated } from '../../../types/types';
import JavascriptPackageManager from './javascript_package_manager';

export class Bun extends JavascriptPackageManager implements JavascriptPackageManagerInterface {
    protected readonly locks = ['bun.lock'];
    protected readonly startsWith: string = 'packageName';

    getName(): string {
        return 'bun';
    }

    getLatestVersions(): outdated[] {
        const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;

        const outdatedResponse = cp.execSync('bun outdated', {
            cwd: rootPath,
        }).toString();

        return outdatedResponse.split('\n')
            .filter(line => line.includes('|') && /\d/.test(line))
            .map(line => {
                const lineParts = line.split('|').filter(part => part !== '').map(part => part.trim());

                return {
                    package: lineParts[0],
                    version: lineParts[1],
                    latestVersion: lineParts[3],
                };
            });
    }
}
