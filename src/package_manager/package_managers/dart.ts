import * as jsYaml from 'js-yaml';
import { PackageManager } from '../../interfaces/package_manager';
import { Parser } from '../../parser/parser';
import { InstalledPackage, Language, outdated } from '../../types/types';
import { LanguagePackageManager } from '../language_package_manager';

export class Dart extends LanguagePackageManager implements PackageManager {
    private static installedPackages: {[key: string]: any} = {};
    protected name: Language = 'dart';
    protected readonly outdatedPackagesCommand: string = 'dart pub outdated --json';
    protected readonly packagePattern: string = 'placeholder: ';

    async getInstalled(packageName: string): Promise<InstalledPackage> {
        Dart.installedPackages = new Parser("pub").parse(await this.lockFileContent())['dependencies'];
        const installedPackageName = Object.keys(Dart.installedPackages).find((pkgName: string) => pkgName === packageName);

        if (installedPackageName) {
            const installedPackage = Dart.installedPackages[installedPackageName];

            return {
                name: packageName,
                version: installedPackage.version,
            };
        }

        return { name: '', version: '' };
    }
    
    async getLinkOfPackage(packageName: string): Promise<string> {
        return `https://pub.dev/packages/${packageName}`;
    }

    override getLockPath(): string {
        return 'pubspec.lock';
    }

    getLatestVersions(): outdated[] {
        const outdatedPackages = this.getOutdatedPackages();

        return JSON.parse(outdatedPackages).packages
            .map((pkg: {package: string, current: {version: string}, latest: {version: string}}) => {
                return {
                    package: pkg.package,
                    version: pkg.current.version,
                    latestVersion: pkg.latest.version,
                };
            });
    }

    getPackagesNames(content: string): Set<string> {
        const depFileContent = jsYaml.load(content);

        return new Set<string>([
            // @ts-ignore
            ...Object.keys(depFileContent['dependencies'] || {}),
            // @ts-ignore
            ...Object.keys(depFileContent['dev_dependencies'] || {}),
        ]);
    }
}
