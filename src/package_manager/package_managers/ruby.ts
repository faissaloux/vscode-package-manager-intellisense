import * as vscode from 'vscode';
import { pathJoin } from '../../util/globals';
import { Parser } from '../../parser/parser';

export class Ruby implements PackageManager {
    rootPath: string;

    constructor(packageJsonFilePath: string) {
        this.rootPath = packageJsonFilePath.replace(new RegExp('Gemfile$'), '');
    }

    async getInstalled(packageName: string): Promise<any> {
        const lockPath = await this.getLockPath();
        const lockFile = vscode.Uri.file(lockPath);
        const lockFileContent = await vscode.workspace.fs.readFile(lockFile);

        const installedPackages = new Parser("rubygems").parse(lockFileContent.toString());

        const packageFound = Object.keys(installedPackages.GEM.specs).find((pkg: string) => pkg.startsWith(packageName)) || "";

        const packageAndVersion = packageFound.split(" ");
        const betweenParenthesesRegExp = /\(([^)]+)\)/;
        const matches = betweenParenthesesRegExp.exec(packageAndVersion[1]) || "n/a";

        return {
            "name": packageAndVersion[0],
            "version": matches[1],
        };
    }

    async getLockPath(): Promise<string> {
        return pathJoin(this.rootPath, 'Gemfile.lock');
    }
}
