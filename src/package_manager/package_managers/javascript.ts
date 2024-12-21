import * as vscode from 'vscode';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { pathJoin } from '../../util/globals';

export class Javascript extends LanguagePackageManager implements PackageManager {
    packageManager: string = 'npm';
    locks: {[key: string]: string} = {
        'npm': 'package-lock.json',
        'yarn': 'yarn.lock',
        'pnpm': 'pnpm-lock.yaml',
    };
    startsWith: {[key: string]: string} = {
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

        if (this.packageManager === 'pnpm') {
            this.appendVersion(installedPackages);
        }
        
        return Object.entries(installedPackages).find(([title, details]) => title.startsWith(this.lockPackageStartsWith(packageName)))?.[1];
    }

    override getLockPath(): string {
        return pathJoin(this.rootPath, this.locks[this.packageManager]);
    }

    async getPackageManager(): Promise<string> {
        for (const lock in this.locks) {
            let lockFile = vscode.Uri.file(pathJoin(this.rootPath, this.locks[lock]));

            try{
                await vscode.workspace.fs.readFile(lockFile);

                return lock;
            } catch (error) {}
        }

        return Object.keys(this.locks)[0];
    }

    lockPackageStartsWith(packageName: string): string {
        return this.startsWith[this.packageManager].replace('packageName', packageName);
    }

    appendVersion(packages: {[key: string]: any}) {
        for ( const pkg in packages) {
            let version = pkg.match(/\d+(\.\d+)+/);

            if (version) {
                packages[pkg]['version'] = version[0];
            }
        }
    }
}
