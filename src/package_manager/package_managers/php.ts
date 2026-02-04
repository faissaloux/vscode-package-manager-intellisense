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
            latestVersion: this.getLatestVersion(packageName),
        };
    }

    getLinkOfPackage(packageName: string): Promise<string|void> {
        const installedPackage = Php.installedPackages.find((pkg: ComposerInstalledPackage) => pkg.name === packageName);

        return installedPackage?.source.url.replace(".git", "");
    }

    override getLockPath(): string {
        return pathJoin(this.rootPath, 'vendor', 'composer', 'installed.json');
    }

    getLatestVersion(packageName: string): string {
        const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : undefined;

        const outdatedResponse = cp.execSync(`composer outdated ${packageName} --direct`, {
            cwd: rootPath,
        }).toString();
        const latestVersionLine: string = outdatedResponse.split('\n').filter(line => line.includes('latest'))[0];
        const latestVersion: string = latestVersionLine.split(':')[1].split(' ')[1];

        return latestVersion;
    }
}
