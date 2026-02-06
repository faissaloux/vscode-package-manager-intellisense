import { pathJoin } from '../../util/globals';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { ComposerInstalledPackage, InstalledPackage, Language, outdated } from '../../types/types';

export class Php extends LanguagePackageManager implements PackageManager {
    private static installedPackages: {[key: string]: any} = {};
    protected name: Language = 'php';
    protected readonly outdatedPackagesCommand: string = 'composer outdated --direct --format=json';
    protected readonly packagePattern: string = '"placeholder": "';
    protected override readonly excluded: string[] = [
        'php',
    ];

    async getInstalled(packageName: string): Promise<InstalledPackage> {
        Php.installedPackages = new Parser("composer").parse(await this.lockFileContent())['dependencies'];
        const installedPackage = Php.installedPackages.find((pkg: ComposerInstalledPackage) => pkg.name === packageName);

        return {
            name: installedPackage.name,
            version: installedPackage.version,
        };
    }

    getLinkOfPackage(packageName: string): Promise<string> {
        const installedPackage = Php.installedPackages.find((pkg: ComposerInstalledPackage) => pkg.name === packageName);

        return installedPackage?.source.url.replace(".git", "");
    }

    override getLockPath(): string {
        return pathJoin('vendor', 'composer', 'installed.json');
    }

    getLatestVersions(): outdated[] {
        const outdatedPackages = this.getOutdatedPackages();

        return JSON.parse(outdatedPackages).installed
            .map((pkg: {name: string, version: string, latest: string}) => {
                return {
                    package: pkg.name,
                    version: pkg.version,
                    latestVersion: pkg.latest,
                };
            });
    }

    getPackagesNames(content: string): Set<string> {
        const jsonContent = JSON.parse(content);

        return new Set<string>([
            ...Object.keys(jsonContent['require'] || {}),
            ...Object.keys(jsonContent['require-dev'] || {}),
            ...Object.keys(jsonContent['conflict'] || {}),
        ]);
    }
}
