import * as vscode from 'vscode';
import * as toml from '@iarna/toml';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { Parser } from '../../parser/parser';
import { InstalledPackage, Language, outdated } from '../../types/types';

export class Rust extends LanguagePackageManager implements PackageManager {
    protected name: Language = 'rust';
    protected readonly outdatedPackagesCommand: string = 'cargo outdated';
    protected readonly packagePattern: string = 'placeholder ';

    async getInstalled(packageName: string, _line: string): Promise<InstalledPackage> {
        const installedPackages = new Parser("cargo").parse(await this.lockFileContent())['dependencies'];

        const packageFound = installedPackages.find((pkg: {name: string}) => pkg.name === packageName);

        if (packageFound) {
            return {
                name: packageFound.name,
                version: packageFound.version,
            };
        }

        return { name: '', version: ''};
    }

    override getLockPath(): string {
        return 'Cargo.lock';
    }

    getLatestVersions(): outdated[] {
        const outdatedPackages = this.getOutdatedPackages();
        
        if (outdatedPackages === '') {
            vscode.window.showWarningMessage(
                'You need to install cargo-outdated to be able to see the latest versions of your dependencies.\n' +
                'Run: cargo install cargo-outdated',
            );
        }

        return outdatedPackages.split('\n')
            .filter(line => /\d/.test(line))
            .map(line => {
                const lineParts = line.split('  ').filter(part => part !== '').map(part => part.trim());

                return {
                    package: lineParts[0],
                    version: lineParts[1],
                    latestVersion: lineParts[3],
                };
            });
    }

    getPackagesNames(content: string): Set<string> {
        const jsonContent = toml.parse(content);

        return new Set<string>([
            ...Object.keys(jsonContent['dependencies'] || {}),
            ...Object.keys(jsonContent['dev-dependencies'] || {}),
        ]);
    }
}
