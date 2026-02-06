import axios from 'axios';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { InstalledPackage, Language, outdated } from '../../types/types';
import { JavascriptPackageManagerInterface } from '../../interfaces/javascript_package_manager';
import { Bun } from './javascript/bun';
import { Npm } from './javascript/npm';
import { Yarn } from './javascript/yarn';
import { Pnpm } from './javascript/pnpm';

type JavascriptPackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export class Javascript extends LanguagePackageManager implements PackageManager {
    protected name: Language = 'javascript';
    static packageManager: JavascriptPackageManagerInterface = new Npm;
    private packageManagers: {[key in JavascriptPackageManager]: JavascriptPackageManagerInterface} = {
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
