import { pathJoin } from '../../util/globals';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { Parser } from '../../parser/parser';
import { InstalledPackage } from '../../types/types';

export class Rust extends LanguagePackageManager implements PackageManager {
    async getInstalled(packageName: string): Promise<InstalledPackage|undefined> {
        const installedPackages = new Parser("cargo").parse(await this.lockFileContent())['dependencies'];

        const packageFound = installedPackages.find((pkg: {name: string}) => pkg.name === packageName);

        if (packageFound) {
            return {
                name: packageFound.name,
                version: packageFound.version,
            };
        }

        return;
    }

    override getLockPath(): string {
        return pathJoin(this.rootPath, 'Cargo.lock');
    }
}
