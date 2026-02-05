import * as vscode from 'vscode';
import * as fs from 'fs';
import axios from 'axios';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { pathJoin } from '../../util/globals';
import { InstalledPackage, outdated } from '../../types/types';
import { JsPkgManager } from './javascript/JsPkgManager';
import { Bun } from './javascript/bun';
import { Npm } from './javascript/npm';
import { Yarn } from './javascript/yarn';

type JavascriptPackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
type JavascriptDependenciesLockFile = 'package-lock.json' | 'npm-shrinkwrap.json' | 'yarn.lock' | 'pnpm-lock.yaml' | 'bun.lock';

export class Javascript extends LanguagePackageManager implements PackageManager {
    static packageManager: JavascriptPackageManager = 'npm';
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
        'yarn': 'packageName@version',
        'pnpm': {
            /* eslint-disable @typescript-eslint/naming-convention */
            '5.3': '/packageName/',
            '6': '/packageName@',
            '9': 'packageName@',
            /* eslint-enable */
        },
        'bun': 'packageName',
    };
    private packageManagers: {[key in JavascriptPackageManager]: typeof JsPkgManager} = {
        'bun': Bun,
        'npm': Npm,
        'yarn': Yarn,
    };

    async getInstalled(packageName: string, line: string): Promise<InstalledPackage|undefined> {
        Javascript.packageManager = await this.getPackageManager();
        if (!vscode.workspace.getConfiguration().get(`package-manager-intellisense.${Javascript.packageManager}.enable`)) {
            return;
        }

        const lockFileParsed = new Parser(Javascript.packageManager).parse(await this.lockFileContent());
        const installedPackages = lockFileParsed['dependencies'];
        this.lockVersion = lockFileParsed['lockVersion'];

        const installedPackage = Object.entries(installedPackages).find(([title, details]) => title.startsWith(this.lockPackageStartsWith(packageName, this.getVersion(line))))?.[1];

        return {
            name: packageName,
            // @ts-ignore
            version: installedPackage.version,
        };
    }

    getLatestVersions(): outdated[]|undefined {
        if (!vscode.workspace.getConfiguration().get(`package-manager-intellisense.${Javascript.packageManager}.enable`)) {
            return;
        }

        return new this.packageManagers[Javascript.packageManager]().getLatestVersions();
    }

    async getLinkOfPackage(packageName: string): Promise<string|void> {
        let link: string = '';

        await axios.get(`https://registry.npmjs.org/${packageName}`)
            .then(response => response.data)
            .then(data => {
                link = data.repository ? data.repository.url : data.homepage;

                link = link.replace(".git", "").replace("git+", "").replace("git:", "https:");
            });

        return link;
    }

    override getLockPath(): string {
        let lockFiles: JavascriptDependenciesLockFile|JavascriptDependenciesLockFile[] = this.locks[Javascript.packageManager];

        if (typeof lockFiles === 'string') {
            lockFiles = [lockFiles as JavascriptDependenciesLockFile];
        }

        for (const lockFile of lockFiles as JavascriptDependenciesLockFile[]) {
            const lockPath: string = pathJoin(this.rootPath, lockFile);

            if (fs.existsSync(lockPath)) {
                return lockPath;
            }
        };

        return '';
    }

    async getPackageManager(): Promise<JavascriptPackageManager> {
        for (let [packageManager, lockFiles] of Object.entries(this.locks)) {
            if (typeof lockFiles === 'string') {
                lockFiles = [lockFiles];
            }

            for (const lockFile of lockFiles) {
                const lockPath: string = pathJoin(this.rootPath, lockFile);
                if (fs.existsSync(lockPath)) {
                    return packageManager as JavascriptPackageManager;
                }
            };
        }

        return (Object.keys(this.locks) as JavascriptPackageManager[])[0];
    }

    lockPackageStartsWith(packageName: string, version: string): string {
        const pattern =  this.startsWith[Javascript.packageManager];

        if (typeof pattern === 'object' && this.lockVersion) {
            const lockVersion = Number(this.lockVersion);

            if (pattern[lockVersion]) {
                return pattern[lockVersion].replace('packageName', packageName).replace('version', version);
            }

            let lastVersion = Object.keys(pattern).sort().at(0);

            if (lastVersion !== undefined) {
                for (const version of Object.keys(pattern).sort()) {
                    if (Number(version) > lockVersion ) {
                        return pattern[lastVersion].replace('packageName', packageName).replace('version', version);
                    }

                    lastVersion = version;
                }

                return pattern[lastVersion].replace('packageName', packageName).replace('version', version);
            }
        }

        return (pattern as string).replace('packageName', packageName).replace('version', version);
    }

    getVersion(line: string): string {
        let version = '';

        const insideDoubleQuotes = line.match(/"(.*?)"/g);
        if (insideDoubleQuotes) {
            version = insideDoubleQuotes[1]?.replaceAll('"', '');
        }

        return version;
    }
}
