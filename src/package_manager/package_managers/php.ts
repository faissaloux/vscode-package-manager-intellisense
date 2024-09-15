import { pathJoin } from '../../util/globals';
import * as types from '../../types/types';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';

export class Php extends LanguagePackageManager implements PackageManager {
    async getInstalled(packageName: string): Promise<any> {
        const installedPackages = new Parser("composer").parse(await this.lockFileContent());

        return installedPackages.find((pkg: types.ComposerInstalledPackage) => pkg.name === packageName);
    }

    override getLockPath(): string {
        return pathJoin(this.rootPath, 'vendor', 'composer', 'installed.json');
    }
}
