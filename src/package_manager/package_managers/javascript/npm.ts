import * as vscode from 'vscode';
import * as cp from 'child_process';
import { JsPkgManager } from "./JsPkgManager";
import { outdated } from '../../../types/types';

export class Npm implements JsPkgManager {
    getLatestVersions(): outdated[] {
        const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;

        let outdatedResponse: string;
        try {
            outdatedResponse = cp.execSync('npm outdated --json', {
                cwd: rootPath,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
        } catch (err: any) {
            if (err.stdout) {
                outdatedResponse = err.stdout.toString();
            } else {
                return [];
            }
        }

        const outdatedPackages = Object.entries(JSON.parse(outdatedResponse))
            .map(([pkgName, pkg]: [string, {current: string, latest: string}]) => {
                return {
                    package: pkgName,
                    version: pkg.current,
                    latestVersion: pkg.latest,
                };
            });

        return outdatedPackages;
    }
}
