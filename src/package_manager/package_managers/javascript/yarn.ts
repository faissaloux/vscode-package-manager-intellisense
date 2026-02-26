import JavascriptPackageManager from './javascript_package_manager';
import type { JavascriptPackageManagerInterface } from "../../../interfaces/javascript_package_manager";
import type { outdated } from '../../../types/types';

export class Yarn extends JavascriptPackageManager implements JavascriptPackageManagerInterface {
    protected readonly locks = ['yarn.lock'];
    protected readonly startsWith: string = 'packageName@version';
    protected readonly outdatedPackagesCommand: string = 'yarn outdated --json';

    getName(): string {
        return 'yarn';
    }

    getLatestVersions(): outdated[]|false {
        const outdatedPackages: string = this.getOutdatedPackages().split('\n')[1];

        if (typeof JSON.parse(outdatedPackages).data === 'string') {
            return false;
        }

        return JSON.parse(outdatedPackages).data.body
            .map((pkg: string[]) => ({
                    package: pkg[0],
                    version: pkg[1],
                    latestVersion: pkg[3],
                }));
    }
}
