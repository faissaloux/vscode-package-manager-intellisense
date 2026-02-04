import { pathJoin } from '../../util/globals';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { ComposerInstalledPackage, InstalledPackage } from '../../types/types';
import * as cp from 'child_process';
import * as vscode from 'vscode';

export class Php extends LanguagePackageManager implements PackageManager {
    private static installedPackages: {[key: string]: any} = {};

    async getInstalled(packageName: string): Promise<InstalledPackage> {
        Php.installedPackages = new Parser("composer").parse(await this.lockFileContent())['dependencies'];
        const installedPackage = Php.installedPackages.find((pkg: ComposerInstalledPackage) => pkg.name === packageName);

        return {
            name: installedPackage.name,
            version: installedPackage.version,
        };
    }

    getLinkOfPackage(packageName: string): Promise<string|void> {
        const installedPackage = Php.installedPackages.find((pkg: ComposerInstalledPackage) => pkg.name === packageName);

        return installedPackage?.source.url.replace(".git", "");
    }

    override getLockPath(): string {
        return pathJoin(this.rootPath, 'vendor', 'composer', 'installed.json');
    }

    getLatestVersions(): {package: string, version: string, latestVersion: string}[] {
        const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;

        const outdatedResponse = cp.execSync(`composer outdated --direct --format=json`, {
            cwd: rootPath,
        }).toString();
        const installedPackages = JSON.parse(outdatedResponse).installed.map((pkg: {name: string, version: string, latest: string}) => {
            return {
                package: pkg.name,
                version: pkg.version,
                latestVersion: pkg.latest,
            };
        });

        return installedPackages;
    }
}
