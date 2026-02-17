import { JavascriptPackageManagerInterface } from "../../../interfaces/javascript_package_manager";
import { outdated } from "../../../types/types";
import JavascriptPackageManager from './javascript_package_manager';

export class Pnpm extends JavascriptPackageManager implements JavascriptPackageManagerInterface {
    protected readonly locks = ['pnpm-lock.yaml'];
    protected readonly outdatedPackagesCommand: string = 'pnpm outdated --json';
    protected readonly startsWith: {[version: string | number]: string} = {
        /* eslint-disable @typescript-eslint/naming-convention */
        '5.3': '/packageName/',
        '6': '/packageName@',
        '9': 'packageName@',
        /* eslint-enable */
    };

    getName(): string {
        return 'pnpm';
    }

    getLatestVersions(): outdated[] {
        const outdatedPackages: string = this.getOutdatedPackages().replace(/.*(WARN|FAIL).*/g, '');

        return Object.entries(JSON.parse(outdatedPackages))
            // @ts-ignore
            .map(([pkgName, pkg]: [string, {current: string, latest: string}]) => {
                return {
                    package: pkgName.replace('(dev)', '').trim(),
                    version: pkg.current,
                    latestVersion: pkg.latest,
                };
            });
    }
}
