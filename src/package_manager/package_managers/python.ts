import { pathJoin } from '../../util/globals';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { InstalledPackage } from '../../types/types';
import { Parser } from '../../parser/parser';

export class Python extends LanguagePackageManager implements PackageManager {
    async getInstalled(packageName: string): Promise<InstalledPackage> {
        const installedPackages = new Parser("poetry").parse(await this.lockFileContent())['dependencies'];
        const packageFound = installedPackages.find((pkg: string) => pkg.name === packageName);

        return {
            name: packageFound.name,
            version: packageFound.version,
        };
    }

    override getLockPath(): string {
        return pathJoin(this.rootPath, 'poetry.lock');
    }
}
