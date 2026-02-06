import { JavascriptPackageManagerInterface } from "../../../interfaces/javascript_package_manager";
import { outdated } from '../../../types/types';
import JavascriptPackageManager from './javascript_package_manager';

export class Npm extends JavascriptPackageManager implements JavascriptPackageManagerInterface {
    protected readonly locks = [
        'package-lock.json',
        'npm-shrinkwrap.json',
    ];
    protected readonly startsWith: string = 'packageName';
    protected readonly outdatedPackagesCommand: string = 'npm outdated --json';

    getName(): string {
        return 'npm';
    }

    getLatestVersions(): outdated[] {
        const outdatedPackages: string = this.getOutdatedPackages();

        return Object.entries(JSON.parse(outdatedPackages))
            .map(([pkgName, pkg]: [string, {current: string, latest: string}]) => {
                return {
                    package: pkgName,
                    version: pkg.current,
                    latestVersion: pkg.latest,
                };
            });
    }
}
