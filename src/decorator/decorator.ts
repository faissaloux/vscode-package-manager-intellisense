import * as vscode from 'vscode';
import * as globals from '../util/globals';
import { PackageManager as PackageManagerInterface } from '../interfaces/package_manager';
import { Link } from './link';
import { Line, InstalledPackage, outdated } from '../types/types';

export class Decorator {
    private readonly defaultVersion: string = 'n/a';
    private readonly color: string = 'grey';
    private readonly latestVersionColor: string = '#F56747';
    private readonly margin: string = '0 0 0 1rem';
    private readonly packagesToExclude: string[] = [
        'php',
    ];
    private targets: Line[] = [];

    constructor (private readonly editor: vscode.TextEditor, private readonly packageManager: PackageManagerInterface) {
        return this;
    }

    async decorate() {
        let content: string = this.editor.document.getText();
        const packagesNames: Set<string> = this.packageManager.getPackagesNames(content);

        await this.showPackagesVersions(packagesNames);
        await this.showPackagesLatestVersions();
        await this.showPackagesLinks();
    }

    async showPackagesVersions(packagesNames: Set<string>) {
        const decorations: vscode.DecorationOptions[] = [];

        for (const packageName of packagesNames) {
            if (this.packagesToExclude.indexOf(packageName) !== -1) {
                continue;
            }

            let lines: Line[] = this.packageManager.getLines(this.editor.document, packageName);
            this.targets.push(...lines);

            for (const line of lines) {
                let installedPackage = await this.packageManager.getInstalled(packageName, line["content"]);
                let version = this.defaultVersion;

                if(installedPackage?.version) {
                    version = `v${installedPackage?.version.replace('v', '')}`;
                }

                if (installedPackage !== null) {
                    decorations.push(this.decoration(version, line["lineNumber"], this.color, 1024));
                }
            }
        }

        this.editor.setDecorations(globals.decorationType, decorations);
    }

    async showPackagesLatestVersions() {
        const decorations: vscode.DecorationOptions[] = [];
        const latestVersions: outdated[] = await this.packageManager.getLatestVersions();

        for (const line of this.targets) {
            const thePackage = latestVersions.find(pkg => pkg.package === line.package);

            if (thePackage && thePackage.version !== thePackage.latestVersion) {
                decorations.push(this.decoration(thePackage.latestVersion, line["lineNumber"], this.latestVersionColor, 1024));
            }
        }

        this.editor.setDecorations(globals.latestVersionDecoration, decorations);
    }

    async showPackagesLinks() {
        const link = new Link;
        for (const line of this.targets) {
            let pkg: InstalledPackage = {
                name: line.package,
                version: '',
            };

            pkg['link'] = await this.packageManager.getLinkOfPackage(line.package);

            if (pkg['link']) {
                link.addPackageLink(pkg, line);
            }
        }

        link.registerLinks();
    }

    decoration(text: string, line: number, color: string, char: number): vscode.DecorationOptions {
        const range: vscode.Range = new vscode.Range(line, char, line, char);
        const renderOptions = {
            after: {
                contentText: text,
                color,
                margin: this.margin,
            }
        };

        return {range: range, renderOptions: renderOptions};
    }
}
