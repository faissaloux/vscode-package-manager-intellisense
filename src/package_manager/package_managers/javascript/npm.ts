import * as vscode from 'vscode';
import * as cp from 'child_process';
import { JavascriptPackageManagerInterface } from "../../../interfaces/javascript_package_manager";
import { outdated } from '../../../types/types';
import JavascriptPackageManager from './javascript_package_manager';

export class Npm extends JavascriptPackageManager implements JavascriptPackageManagerInterface {
    protected readonly locks = [
        'package-lock.json',
        'npm-shrinkwrap.json',
    ];
    protected readonly startsWith: string = 'packageName';

    getName(): string {
        return 'npm';
    }

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
