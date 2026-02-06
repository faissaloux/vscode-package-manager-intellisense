import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { InstalledPackage, Language, outdated } from '../../types/types';
import { Parser } from '../../parser/parser';
import * as cp from 'child_process';
import * as vscode from 'vscode';

export class Python extends LanguagePackageManager implements PackageManager {
    protected name: Language = 'python';

    async getInstalled(packageName: string): Promise<InstalledPackage> {
        const installedPackages = new Parser("poetry").parse(await this.lockFileContent())['dependencies'];
        const packageFound = installedPackages.find((pkg: {[key: string]: any}) => pkg.name === packageName);

        return {
            name: packageFound.name,
            version: packageFound.version,
        };
    }

    getLatestVersions(): outdated[] {
        const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;

        const outdatedResponse = cp.execSync(`poetry show --outdated --format json`, {
            cwd: rootPath,
        }).toString();
        const installedPackages = JSON.parse(outdatedResponse).map((pkg: {name: string, version: string, latest_version: string}) => {
            return {
                package: pkg.name,
                version: pkg.version,
                latestVersion: pkg.latest_version,
            };
        });

        return installedPackages;
    }

    override getLockPath(): string {
        return 'poetry.lock';
    }
}
