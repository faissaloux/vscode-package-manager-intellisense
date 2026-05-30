import PythonPackageManager from "./python_package_manager";
import type { PythonPackageManagerInterface } from "../../../interfaces/python_package_manager";
import type { outdated } from "../../../types/types";

export class Uv extends PythonPackageManager implements PythonPackageManagerInterface {
    protected readonly locks = [
        'uv.lock',
    ];
    protected readonly outdatedPackagesCommand: string = 'uv pip list --outdated --format=json';

    getName(): string {
        return 'uv';
    }

    getLatestVersions(): outdated[]|false {
        const outdatedPackages = this.getOutdatedPackages();

        if (outdatedPackages.length === 0) {
            return false;
        }

        return JSON.parse(outdatedPackages).map((pkg: {name: string, version: string, latest_version: string}) => ({
                package: pkg.name,
                version: pkg.version,
                latestVersion: pkg.latest_version,
            }));
    }
}