import type { abandoned, ComposerInstalledPackage, InstalledPackage, Language, outdated } from '../../types/types';
import { LanguagePackageManager } from '../language_package_manager';
import type { PackageManager } from '../../interfaces/package_manager';
import { Parser } from '../../parser/parser';
import { pathJoin, rootPath } from '../../util/globals';
import * as cp from 'child_process';

export class Php extends LanguagePackageManager implements PackageManager {
    private static installedPackages: Record<string, any> = {};
    protected name: Language = 'php';
    protected readonly outdatedPackagesCommand: string = 'composer outdated --direct --format=json';
    protected readonly abondonedPackagesCommand: string = 'composer audit --format=json';
    protected readonly packagePattern: string = '"placeholder": "';
    protected override readonly excluded: string[] = [
        'php',
    ];

    async getInstalled(packageName: string): Promise<InstalledPackage> {
        Php.installedPackages = new Parser("composer").parse(await this.lockFileContent())['dependencies'];
        const installedPackage = Php.installedPackages.find((pkg: ComposerInstalledPackage) => pkg.name === packageName);

        return {
            name: installedPackage.name,
            version: installedPackage.version,
        };
    }

    getLinkOfPackage(packageName: string): Promise<string> {
        const installedPackage = Php.installedPackages.find((pkg: ComposerInstalledPackage) => pkg.name === packageName);

        return installedPackage?.source.url.replace(".git", "");
    }

    override getLockPath(): string {
        return pathJoin('vendor', 'composer', 'installed.json');
    }

    getLatestVersions(): outdated[] {
        const outdatedPackages = this.getOutdatedPackages();

        return JSON.parse(outdatedPackages).installed
            .map((pkg: {name: string, version: string, latest: string}) => ({
                    package: pkg.name,
                    version: pkg.version,
                    latestVersion: pkg.latest,
                }));
    }

    getPackagesNames(content: string): Set<string> {
        const jsonContent = JSON.parse(content);

        return new Set<string>([
            ...Object.keys(jsonContent['require'] || {}),
            ...Object.keys(jsonContent['require-dev'] || {}),
            ...Object.keys(jsonContent['conflict'] || {}),
        ]);
    }

    getAbandoned(): abandoned[] {
        let abondonedPackages: string;
        try {
            abondonedPackages = cp.execSync(this.abondonedPackagesCommand, {
                cwd: rootPath,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
        } catch (error: any) {
            if (error.stdout) {
                abondonedPackages = error.stdout.toString();
            } else {
                return [];
            }
        }

        return Object.keys(JSON.parse(abondonedPackages).abandoned).map(pkg => ({
            'package': pkg,
        }));
    }
}
