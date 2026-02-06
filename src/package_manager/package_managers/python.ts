import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { InstalledPackage, Language, outdated } from '../../types/types';
import { Parser } from '../../parser/parser';

export class Python extends LanguagePackageManager implements PackageManager {
    protected name: Language = 'python';
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
        console.log(outdatedPackages);
        const installedPackages = JSON.parse(outdatedPackages).map((pkg: {name: string, version: string, latest_version: string}) => {
            return {
                package: pkg.name,
                version: pkg.version,
                latestVersion: pkg.latest_version,
            };
        });

        return installedPackages;
    }

    override getLockPath(): string {
        return 'poetry.lock';
    }
}
