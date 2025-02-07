import * as vscode from 'vscode';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { pathJoin } from '../../util/globals';

type JavascriptPackageManager = 'npm' | 'yarn' | 'pnpm';
type JavascriptDependenciesLockFile = 'package-lock.json' | 'yarn.lock' | 'pnpm-lock.yaml';

export class Javascript extends LanguagePackageManager implements PackageManager {
    packageManager: JavascriptPackageManager = 'npm';
    locks: {[key in JavascriptPackageManager]: JavascriptDependenciesLockFile} = {
        'npm': 'package-lock.json',
        'yarn': 'yarn.lock',
        'pnpm': 'pnpm-lock.yaml',
    };
    startsWith: {[key in JavascriptPackageManager]: string} = {
        'npm': 'packageName',
        'yarn': 'packageName@',
        'pnpm': '/packageName/',
    };

    async getInstalled(packageName: string): Promise<any> {
        this.packageManager = await this.getPackageManager();
        const installedPackages = new Parser(this.packageManager).parse(await this.lockFileContent());

        if (!vscode.workspace.getConfiguration().get(`package-manager-intellisense.${this.packageManager}.enable`)) {
            return null;
        }

        return Object.entries(installedPackages).find(([title, details]) => title.startsWith(this.lockPackageStartsWith(packageName)))?.[1];
    }

    override getLockPath(): string {
        return pathJoin(this.rootPath, this.locks[this.packageManager]);
    }

    async getPackageManager(): Promise<JavascriptPackageManager> {
        for (const lock in this.locks) {
            let lockFile = vscode.Uri.file(pathJoin(this.rootPath, this.locks[lock as JavascriptPackageManager]));

            try{
                await vscode.workspace.fs.readFile(lockFile);

                return lock as JavascriptPackageManager;
            } catch (error) {}
        }

        return (Object.keys(this.locks) as JavascriptPackageManager[])[0];
    }

    lockPackageStartsWith(packageName: string): string {
        return this.startsWith[this.packageManager].replace('packageName', packageName);
    }
}
