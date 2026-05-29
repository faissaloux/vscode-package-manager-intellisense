import * as toml from '@iarna/toml';
import type { InstalledPackage, Language, outdated } from '../../types/types';
import { LanguagePackageManager } from '../language_package_manager';
import type { PackageManager } from '../../interfaces/package_manager';
import { Parser } from '../../parser/parser';
import { Poetry } from './python/poetry';
import type { PythonPackageManagerInterface } from '../../interfaces/python_package_manager';

type PythonPackageManager = 'poetry';

export class Python extends LanguagePackageManager implements PackageManager {
    protected name: Language = 'python';
    protected readonly packagePattern: string = '^\\s*"placeholder(?:\\[[a-zA-Z,]+\\])?\\s\\([^)]+\\)';
    static packageManager: PythonPackageManagerInterface = new Poetry;
    private packageManagers: Record<PythonPackageManager, PythonPackageManagerInterface> = {
        'poetry': new Poetry,
    };
    protected readonly outdatedPackagesCommand: string = 'poetry show --outdated --format json';

    async getInstalled(packageName: string): Promise<InstalledPackage> {
        Python.packageManager = await this.getSubPackageManager();

        const installedPackages = new Parser(Python.packageManager.getName()).parse(await this.lockFileContent())['dependencies'];
        const packageFound = installedPackages.find((pkg: Record<string, any>) => pkg.name === packageName);

        return {
            name: packageFound.name,
            version: packageFound.version,
        };
    }

    getLatestVersions(): outdated[]|false {
        return Python.packageManager.getLatestVersions();
    }

    override getLockPath(): string {
        return Python.packageManager.getLockPath();
    }

    async getSubPackageManager(): Promise<PythonPackageManagerInterface> {
        for (const packagemanager of Object.values(this.packageManagers)) {
            if (packagemanager.isAlive()) {
                return packagemanager;
            }
        }

        return Python.packageManager;
    }

    getPackagesNames(content: string): Set<string> {
        const formatted: Record<string, string> = {};
        const jsonContent = toml.parse(content);

        // @ts-ignore
        jsonContent['project']['dependencies'].map((dependency: string) => {
            const [dep, version] = dependency.replace(/\[.*?\]/g, '').split(' ');

            formatted[dep] = version;
        });

        jsonContent['dependencies'] = formatted;

        return new Set<string>(Object.keys(jsonContent['dependencies'] || {}));
    }
}
