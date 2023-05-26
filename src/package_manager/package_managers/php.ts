import path = require('path');
import * as vscode from 'vscode';
import { pathJoin } from '../../util/globals';
import * as types from '../../types/types';

export class Php {
    rootPath: string;

    constructor(packageJsonFilePath: string) {
        this.rootPath = packageJsonFilePath.replace('composer.json', '');
    }

    async getInstalled(packageName: string): Promise<any> {
        const lockPath = await this.getLockPath();

        const lockFile = vscode.Uri.file(lockPath);
        const lockFileContent = await vscode.workspace.fs.readFile(lockFile);

        const installedPackages = this.parse(lockFileContent.toString());

        return installedPackages.find((pkg: types.InstalledPackage) => pkg.name === packageName);
    }

    async getLockPath(): Promise<string> {
        return pathJoin(this.rootPath, 'vendor', 'composer', 'installed.json');
    }

    parse(content: string): {[key: string]: any} {
        return JSON.parse(content).packages;
    }
}
