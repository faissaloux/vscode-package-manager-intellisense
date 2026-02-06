import * as toml from '@iarna/toml';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { Parser } from '../../parser/parser';
import { InstalledPackage, Language } from '../../types/types';

export class Rust extends LanguagePackageManager implements PackageManager {
    protected name: Language = 'rust';

    async getInstalled(packageName: string, line: string): Promise<InstalledPackage> {
        const installedPackages = new Parser("cargo").parse(await this.lockFileContent())['dependencies'];

        const packageFound = installedPackages.find((pkg: {name: string}) => pkg.name === packageName);

        if (packageFound) {
            return {
                name: packageFound.name,
                version: packageFound.version,
            };
        }

        return { name: '', version: ''};
    }

    override getLockPath(): string {
        return 'Cargo.lock';
    }

    getPackagesNames(content: string): Set<string> {
        const jsonContent = toml.parse(content);

        return new Set<string>([
            ...Object.keys(jsonContent['dependencies'] || {}),
            ...Object.keys(jsonContent['dev-dependencies'] || {}),
        ]);
    }
}
