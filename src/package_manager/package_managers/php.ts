import * as vscode from 'vscode';
import { pathJoin } from '../../util/globals';
import * as types from '../../types/types';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';

export class Php implements PackageManager {
    rootPath: string;

    constructor(packageJsonFilePath: string) {
        this.rootPath = packageJsonFilePath.replace(new RegExp('composer.json$'), '');
    }

    async getInstalled(packageName: string): Promise<any> {
        const lockPath = await this.getLockPath();

        const lockFile = vscode.Uri.file(lockPath);
        const lockFileContent = await vscode.workspace.fs.readFile(lockFile);

        const installedPackages = new Parser("composer").parse(lockFileContent.toString());

        return installedPackages.find((pkg: types.ComposerInstalledPackage) => pkg.name === packageName);
    }

    async getLockPath(): Promise<string> {
        return pathJoin(this.rootPath, 'vendor', 'composer', 'installed.json');
    }
}
