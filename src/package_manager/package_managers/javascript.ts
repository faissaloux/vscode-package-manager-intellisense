import * as vscode from 'vscode';
import * as fs from 'fs';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { pathJoin } from '../../util/globals';

type JavascriptPackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
type JavascriptDependenciesLockFile = 'package-lock.json' | 'npm-shrinkwrap.json' | 'yarn.lock' | 'pnpm-lock.yaml' | 'bun.lock';

export class Javascript extends LanguagePackageManager implements PackageManager {
    packageManager: JavascriptPackageManager = 'npm';
    lockVersion: number | null = null;
    locks: {[key in JavascriptPackageManager]: JavascriptDependenciesLockFile|JavascriptDependenciesLockFile[]} = {
        'npm': [
            'package-lock.json',
            'npm-shrinkwrap.json',
        ],
        'yarn': 'yarn.lock',
        'pnpm': 'pnpm-lock.yaml',
        'bun': 'bun.lock',
    };
    startsWith: {[key: string]: string | {[version: string | number]: string}} = {
        'npm': 'packageName',
        'yarn': 'packageName@',
        'pnpm': {
            /* eslint-disable @typescript-eslint/naming-convention */
            '5.3': '/packageName/',
            '6': '/packageName@',
            '9': 'packageName@',
            /* eslint-enable */
        },
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
        if (typeof this.locks[this.packageManager] === 'object') {
            for (const lockFile of this.locks[this.packageManager]) {
                const lockPath: string = pathJoin(this.rootPath, lockFile);
                if (fs.existsSync(lockPath)) {
                    return lockPath;
                }
            };
        }

        return pathJoin(this.rootPath, this.locks[this.packageManager] as string);
    }

    async getPackageManager(): Promise<JavascriptPackageManager> {
        for (const [packageManager, lockFiles] of Object.entries(this.locks)) {
            if (typeof lockFiles === 'object') {
                for (const lockFile of lockFiles) {
                    const lockPath: string = pathJoin(this.rootPath, lockFile);
                    if (fs.existsSync(lockPath)) {
                        return packageManager as JavascriptPackageManager;
                    }
                };
            } else {
                const lockPath: string = pathJoin(this.rootPath, lockFiles);
                if (fs.existsSync(lockPath)) {
                    return packageManager as JavascriptPackageManager;
                }
            };
        }

        return (Object.keys(this.locks) as JavascriptPackageManager[])[0];
    }

    lockPackageStartsWith(packageName: string): string {
        const pattern =  this.startsWith[this.packageManager];

        if (typeof pattern === 'object' && this.lockVersion) {
            const lockVersion = Number(this.lockVersion);

            if (pattern[lockVersion]) {
                return pattern[lockVersion].replace('packageName', packageName);
            }

            let lastVersion = Object.keys(pattern).sort().at(0);

            if (lastVersion !== undefined) {
                for (const version of Object.keys(pattern).sort()) {
                    if (Number(version) > lockVersion ) {
                        return pattern[lastVersion].replace('packageName', packageName);
                    }

                    lastVersion = version;
                }

                return pattern[lastVersion].replace('packageName', packageName);
            }
        }

        return (pattern as string).replace('packageName', packageName);
    }
}
