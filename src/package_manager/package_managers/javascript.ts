import * as fs from 'fs';
import * as vscode from 'vscode';
import axios from 'axios';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { InstalledPackage, Language, outdated } from '../../types/types';
import { JavascriptPackageManagerInterface } from '../../interfaces/javascript_package_manager';
import { Bun } from './javascript/bun';
import { Npm } from './javascript/npm';
import { Yarn } from './javascript/yarn';
import { pathJoin } from '../../util/globals';
import { Pnpm } from './javascript/pnpm';

type JavascriptPackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
type JavascriptDependenciesLockFile = 'package-lock.json' | 'npm-shrinkwrap.json' | 'yarn.lock' | 'pnpm-lock.yaml' | 'bun.lock';

export class Javascript extends LanguagePackageManager implements PackageManager {
    protected name: Language = 'javascript';
    static packageManager: JavascriptPackageManagerInterface = Npm;
    locks: {[key in JavascriptPackageManager]: JavascriptDependenciesLockFile|JavascriptDependenciesLockFile[]} = {
        'npm': [
            'package-lock.json',
            'npm-shrinkwrap.json',
        ],
        'yarn': 'yarn.lock',
        'pnpm': 'pnpm-lock.yaml',
        'bun': 'bun.lock',
    };
    private packageManagers: {[key in JavascriptPackageManager]: typeof JavascriptPackageManagerInterface} = {
        'bun': Bun,
        'npm': Npm,
        'yarn': Yarn,
        'pnpm': Pnpm,
    };

    async getInstalled(packageName: string, line: string): Promise<InstalledPackage> {
        Javascript.packageManager = await this.getSubPackageManager();

        const lockFileParsed = new Parser(Javascript.packageManager.getName()).parse(await this.lockFileContent());
        const installedPackages = lockFileParsed['dependencies'];
        Javascript.packageManager.setLockVersion(lockFileParsed['lockVersion'] ?? 0);

        const installedPackage = Object.entries(installedPackages).find(([title, details]) => title.startsWith(this.lockPackageStartsWith(packageName, this.getVersion(line))))?.[1];

        return {
            name: packageName,
            // @ts-ignore
            version: installedPackage.version,
        };
    }

    async getLinkOfPackage(packageName: string): Promise<string> {
        let link: string = '';

        await axios.get(`https://registry.npmjs.org/${packageName}`)
            .then(response => response.data)
            .then(data => {
                link = data.repository ? data.repository.url : data.homepage;

                link = link.replace(".git", "").replace("git+", "").replace("git:", "https:");
            });

        return link;
    }

    async getSubPackageManager(): Promise<JavascriptPackageManagerInterface> {
        for (let [pkgManager, lockFiles] of Object.entries(this.locks)) {
            if (typeof lockFiles === 'string') {
                lockFiles = [lockFiles];
            }

            for (const lockFile of lockFiles) {
                const rootPath = (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
                    ? vscode.workspace.workspaceFolders[0].uri.fsPath
                    : '';

                const lockPath: string = pathJoin(rootPath, lockFile);
                if (fs.existsSync(lockPath)) {
                    // @ts-ignore
                    return new this.packageManagers[pkgManager];
                }
            };
        }

        // @ts-ignore
        return new Javascript.packageManager;
    }

    getVersion(line: string): string {
        let version = '';

        const insideDoubleQuotes = line.match(/"(.*?)"/g);
        if (insideDoubleQuotes) {
            version = insideDoubleQuotes[1]?.replaceAll('"', '');
        }

        return version;
    }

    getLatestVersions(): outdated[] {
        return Javascript.packageManager.getLatestVersions();
    }

    override getLockPath(): string {
        return Javascript.packageManager.getLockPath();
    }

    lockPackageStartsWith(packageName: string, version: string): string {
        return Javascript.packageManager.lockPackageStartsWith(packageName, version);
    }
}
