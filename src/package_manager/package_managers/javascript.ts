import type { InstalledPackage, Language, outdated } from '../../types/types';
import { Bun } from './javascript/bun';
import type { JavascriptPackageManagerInterface } from '../../interfaces/javascript_package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { Npm } from './javascript/npm';
import type { PackageManager } from '../../interfaces/package_manager';
import { Parser } from '../../parser/parser';
import { Pnpm } from './javascript/pnpm';
import { Yarn } from './javascript/yarn';
import axios from 'axios';

type JavascriptPackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export class Javascript extends LanguagePackageManager implements PackageManager {
    protected name: Language = 'javascript';
    protected readonly packagePattern: string = '"placeholder": "';
    static packageManager: JavascriptPackageManagerInterface = new Npm;
    private packageManagers: Record<JavascriptPackageManager, JavascriptPackageManagerInterface> = {
        'bun': new Bun,
        'npm': new Npm,
        'yarn': new Yarn,
        'pnpm': new Pnpm,
    };

    async getInstalled(packageName: string, line: string): Promise<InstalledPackage> {
        Javascript.packageManager = await this.getSubPackageManager();

        const lockFileParsed = new Parser(Javascript.packageManager.getName()).parse(await this.lockFileContent());
        const installedPackages = lockFileParsed['dependencies'];
        Javascript.packageManager.setLockVersion(lockFileParsed['lockVersion'] ?? 0);

        const installedPackage = Object.entries(installedPackages)
            .find(([title, _details]) => title.startsWith(this.lockPackageStartsWith(packageName, this.getVersion(line))))?.[1];

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

                link = link ? link.replace(".git", "").replace("git+", "").replace("git:", "https:") : '';
            }).catch(_ => {});

        return link;
    }

    async getSubPackageManager(): Promise<JavascriptPackageManagerInterface> {
        for (const packagemanager of Object.values(this.packageManagers)) {
            if (packagemanager.isAlive()) {
                return packagemanager;
            }
        }

        return Javascript.packageManager;
    }

    getVersion(line: string): string {
        let version = '';

        const insideDoubleQuotes = line.match(/"(.*?)"/g);
        if (insideDoubleQuotes) {
            version = insideDoubleQuotes[1]?.replaceAll('"', '');
        }

        return version;
    }

    getLatestVersions(): outdated[]|false {
        return Javascript.packageManager.getLatestVersions();
    }

    override getLockPath(): string {
        return Javascript.packageManager.getLockPath();
    }

    lockPackageStartsWith(packageName: string, version: string): string {
        return Javascript.packageManager.lockPackageStartsWith(packageName, version);
    }

    getPackagesNames(content: string): Set<string> {
        const jsonContent = JSON.parse(content);

        return new Set<string>([
            ...Object.keys(jsonContent['dependencies'] || {}),
            ...Object.keys(jsonContent['devDependencies'] || {}),
        ]);
    }
}
