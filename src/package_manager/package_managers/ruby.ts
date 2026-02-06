import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';
import { InstalledPackage, Language } from '../../types/types';

export class Ruby extends LanguagePackageManager implements PackageManager {
    protected name: Language = 'ruby';

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
}
