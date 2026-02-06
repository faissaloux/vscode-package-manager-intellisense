import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { InstalledPackage, Language } from '../../types/types';
import { Parser as GemfileParser } from '@faissaloux/gemfile';

export class Ruby extends LanguagePackageManager implements PackageManager {
    protected name: Language = 'ruby';
    protected readonly packagePattern: string = 'gem "placeholder"';

    async getInstalled(packageName: string, line: string): Promise<InstalledPackage> {
        const installedPackages = new Parser("rubygems").parse(await this.lockFileContent())['dependencies'];

        const packageFound = Object.keys(installedPackages.GEM.specs).find((pkg: string) => pkg.startsWith(packageName));

        if (packageFound) {
            const packageAndVersion = packageFound.split(" ");
            const betweenParenthesesRegExp = /\(([^)]+)\)/;
            const version = betweenParenthesesRegExp.exec(packageAndVersion[1]) || "n/a";

            return {
                name: packageAndVersion[0],
                version: version[1],
            };
        }

        return { name: '', version: ''};
    }

    override getLockPath(): string {
        return 'Gemfile.lock';
    }

    getPackagesNames(content: string): Set<string> {
        let formatted: {[key: string]: string} = {};
        let jsonContent = new GemfileParser().text(content).parse();
        jsonContent = JSON.parse(jsonContent);

        // @ts-ignore
        jsonContent['dependencies'].forEach(( dependency: {[key: string]: string} ) => {
            formatted[dependency["name"]] = dependency["version"] ?? this.defaultVersion;
        });

        // @ts-ignore
        jsonContent['dependencies'] = formatted;

        return new Set<string>([
            // @ts-ignore
            ...Object.keys(jsonContent['dependencies'] || {}),
        ]);
    }
}
