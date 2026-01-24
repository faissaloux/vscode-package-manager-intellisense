import { pathJoin } from '../../util/globals';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { InstalledPackage } from '../../types/types';

export class Python extends LanguagePackageManager implements PackageManager {
    async getInstalled(packageName: string): Promise<InstalledPackage> {
        return {
            name: '',
            version: '',
        };
    }

    getLinkOfPackage(packageName: string): Promise<string|void> {
        return '';
    }

    override getLockPath(): string {
        return pathJoin(this.rootPath, 'poetry.lock');
    }
}
