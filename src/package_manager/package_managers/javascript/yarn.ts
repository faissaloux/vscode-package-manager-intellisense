import * as vscode from 'vscode';
import * as cp from 'child_process';
import { JsPkgManager } from "./JsPkgManager";
import { outdated } from '../../../types/types';

export class Yarn implements JsPkgManager {
    getLatestVersions(): outdated[] {
        const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;

        let outdatedResponse: string;
        try {
            outdatedResponse = cp.execSync('yarn outdated --json', {
                cwd: rootPath,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
        } catch (err: any) {
            if (err.stdout) {
                outdatedResponse = err.stdout.toString().split('\n')[1];
            } else {
                return [];
            }
        }

        const outdatedPackages = JSON.parse(outdatedResponse).data.body
            .map(pkg => {
                return {
                    package: pkg[0],
                    version: pkg[1],
                    latestVersion: pkg[3],
                };
            });

        return outdatedPackages;
    }
}
