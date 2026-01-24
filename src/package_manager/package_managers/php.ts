import { pathJoin } from '../../util/globals';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { ComposerInstalledPackage, InstalledPackage } from '../../types/types';

export class Php extends LanguagePackageManager implements PackageManager {
    private static installedPackages: {[key: string]: any} = {};

    async getInstalled(packageName: string): Promise<InstalledPackage> {
        Php.installedPackages = new Parser("composer").parse(await this.lockFileContent())['dependencies'];
        const installedPackage = Php.installedPackages.find((pkg: ComposerInstalledPackage) => pkg.name === packageName);

        return {
            name: installedPackage.name,
            version: installedPackage.version,
        };
    }

    getLinkOfPackage(packageName: string): Promise<string|void> {
        const installedPackage = Php.installedPackages.find((pkg: ComposerInstalledPackage) => pkg.name === packageName);

        return installedPackage?.source.url.replace(".git", "");
    }

    override getLockPath(): string {
        return pathJoin(this.rootPath, 'vendor', 'composer', 'installed.json');
    }
}
