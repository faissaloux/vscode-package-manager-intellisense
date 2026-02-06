import * as toml from '@iarna/toml';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { InstalledPackage, Language, outdated } from '../../types/types';
import { Parser } from '../../parser/parser';

export class Python extends LanguagePackageManager implements PackageManager {
    protected name: Language = 'python';
    protected readonly packagePattern: string = '^\\s*"placeholder(?:\\[[a-zA-Z,]+\\])?\\s\\([^)]+\\)';
    protected readonly outdatedPackagesCommand: string = 'poetry show --outdated --format json';

    async getInstalled(packageName: string): Promise<InstalledPackage> {
        const installedPackages = new Parser("poetry").parse(await this.lockFileContent())['dependencies'];
        const packageFound = installedPackages.find((pkg: {[key: string]: any}) => pkg.name === packageName);

        return {
            name: packageFound.name,
            version: packageFound.version,
        };
    }

    getLatestVersions(): outdated[] {
        const outdatedPackages = this.getOutdatedPackages();

        return JSON.parse(outdatedPackages).map((pkg: {name: string, version: string, latest_version: string}) => {
            return {
                package: pkg.name,
                version: pkg.version,
                latestVersion: pkg.latest_version,
            };
        });
    }

    override getLockPath(): string {
        return 'poetry.lock';
    }

    getPackagesNames(content: string): Set<string> {
        let formatted: {[key: string]: string} = {};
        let jsonContent = toml.parse(content);

        // @ts-ignore
        jsonContent['project']['dependencies'].map((dependency: string) => {
            const [dep, version] = dependency.replace(/\[.*?\]/g, '').split(' ');

            formatted[dep] = version;
        });

        jsonContent['dependencies'] = formatted;

        return new Set<string>([
            ...Object.keys(jsonContent['dependencies'] || {}),
        ]);
    }
}
