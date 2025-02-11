import * as vscode from 'vscode';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { pathJoin } from '../../util/globals';

type JavascriptPackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
type JavascriptDependenciesLockFile = 'package-lock.json' | 'yarn.lock' | 'pnpm-lock.yaml' | 'bun.lock';

export class Javascript extends LanguagePackageManager implements PackageManager {
    packageManager: JavascriptPackageManager = 'npm';
    lockVersion: number | null = null;
    locks: {[key in JavascriptPackageManager]: JavascriptDependenciesLockFile} = {
        'npm': 'package-lock.json',
        'yarn': 'yarn.lock',
        'pnpm': 'pnpm-lock.yaml',
        'bun': 'bun.lock',
    };
    startsWith: {[key: string]: string | {[version: string | number]: string}} = {
        'npm': 'packageName',
        'yarn': 'packageName@',
        /* eslint-disable @typescript-eslint/naming-convention */
        'pnpm': {
            '5.4': '/packageName/',
            '6': '/packageName@',
            '9': 'packageName@',
        },
        /* eslint-enable */
        'bun': 'packageName',
    };

    async getInstalled(packageName: string): Promise<any> {
        this.packageManager = await this.getPackageManager();
        const lockFileParsed = new Parser(this.packageManager).parse(await this.lockFileContent());
        const installedPackages = lockFileParsed['dependencies'];
        this.lockVersion = lockFileParsed['lockVersion'];

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
        const pattern =  this.startsWith[this.packageManager];
        if (typeof pattern === 'object' && this.lockVersion) {
            const lockVersion = Number(this.lockVersion);
            if (pattern[lockVersion]) {
                return pattern[lockVersion].replace('packageName', packageName);
            } else {
                let lastVersion = Object.keys(pattern).sort().at(0);
                for (const version of Object.keys(pattern).sort()) {
                    if (Number(version) > lockVersion) {
                        return pattern[lastVersion].replace('packageName', packageName);
                    }
                    lastVersion = version;
                }
                return pattern[Object.keys(pattern).sort().at(-1)].replace('packageName', packageName);
            }
        }

        return (pattern as string).replace('packageName', packageName);
    }
}
