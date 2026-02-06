import { JavascriptPackageManagerInterface } from "../../../interfaces/javascript_package_manager";
import { outdated } from '../../../types/types';
import JavascriptPackageManager from './javascript_package_manager';

export class Bun extends JavascriptPackageManager implements JavascriptPackageManagerInterface {
    protected readonly locks = ['bun.lock'];
    protected readonly startsWith: string = 'packageName';
    protected readonly outdatedPackagesCommand: string = 'bun outdated';

    getName(): string {
        return 'bun';
    }

    getLatestVersions(): outdated[] {
        const outdatedPackages: string = this.getOutdatedPackages();

        return outdatedPackages.split('\n')
            .filter(line => line.includes('|') && /\d/.test(line))
            .map(line => {
                const lineParts = line.split('|').filter(part => part !== '').map(part => part.trim());

                return {
                    package: lineParts[0].replace('(dev)', '').trim(),
                    version: lineParts[1],
                    latestVersion: lineParts[3],
                };
            });
    }
}
