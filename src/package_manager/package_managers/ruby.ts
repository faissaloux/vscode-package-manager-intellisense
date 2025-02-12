import { pathJoin } from '../../util/globals';
import { Parser } from '../../parser/parser';
import { PackageManager } from '../../interfaces/package_manager';
import { LanguagePackageManager } from '../language_package_manager';

export class Ruby extends LanguagePackageManager implements PackageManager {
    async getInstalled(packageName: string): Promise<{[key: string]: string}| undefined> {
        const installedPackages = new Parser("rubygems").parse(await this.lockFileContent())['dependencies'];

        const packageFound = Object.keys(installedPackages.GEM.specs).find((pkg: string) => pkg.startsWith(packageName));

        if (packageFound) {
            const packageAndVersion = packageFound.split(" ");
            const betweenParenthesesRegExp = /\(([^)]+)\)/;
            const matches = betweenParenthesesRegExp.exec(packageAndVersion[1]) || "n/a";

            return {
                "name": packageAndVersion[0],
                "version": matches[1],
            };
        }

        return;
    }

    override getLockPath(): string {
        return pathJoin(this.rootPath, 'Gemfile.lock');
    }
}
