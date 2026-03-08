import * as globals from '../util/globals';
import * as vscode from 'vscode';
import type { InstalledPackage, Line, abandoned, outdated } from '../types/types';
import { Link } from './link';
import type { PackageManager as PackageManagerInterface } from '../interfaces/package_manager';
import type { Php } from '../package_manager/package_managers/php';

export class Decorator {
    private readonly defaultVersion: string = 'n/a';
    private readonly color: string = 'grey';
    private readonly latestVersionColor: string = '#F56747';
    private readonly abandonedColor: string = '#e8e229';
    private readonly margin: string = '0 0 0 1rem';
    private targets: Line[] = [];
    private decorations: Record<string, {
        decoration_type: vscode.TextEditorDecorationType,
        decorations: vscode.DecorationOptions[]
    }> = {};

    constructor (
        private readonly editor: vscode.TextEditor,
        private readonly packageManager: PackageManagerInterface
    ) {}

    async decorate() {
        const content: string = this.editor.document.getText();
        const packagesNames: Set<string> = this.packageManager.getPackagesNames(content);

        await this.showPackagesVersions(packagesNames);
        await this.showPackagesLatestVersions();
        await this.showPackagesLinks();
        if (this.packageManager.getName() === 'php') {
            await this.showAbandoned();
        }

        this.applyDecorations();
    }

    async showPackagesVersions(packagesNames: Set<string>) {
        const decorations: vscode.DecorationOptions[] = [];
        for (const packageName of packagesNames) {
            if (this.packageManager.isExcluded(packageName)) {
                continue;
            }

            const lines: Line[] = this.packageManager.getLines(this.editor.document, packageName);
            this.targets.push(...lines);

            for (const line of lines) {
                const installedPackage = await this.packageManager.getInstalled(packageName, line["content"]);
                let version = this.defaultVersion;

                if(installedPackage?.version) {
                    version = `v${installedPackage?.version.replace('v', '')}`;
                }

                if (installedPackage !== null) {
                    decorations.push(this.decoration(version, line["lineNumber"], this.color, 1024));
                }
            }
        }

        this.decorations['versions'] = {
            decoration_type: globals.decorationType,
            decorations: decorations,
        };
    }

    async showPackagesLatestVersions() {
        const decorations: vscode.DecorationOptions[] = [];
        const latestVersions: outdated[]|false = await this.packageManager.getLatestVersions();

        if (latestVersions) {
            for (const line of this.targets) {
                const thePackage = latestVersions.find(pkg => pkg.package === line.package);
    
                if (thePackage && thePackage.version !== thePackage.latestVersion) {
                    decorations.push(this.decoration(thePackage.latestVersion, line["lineNumber"], this.latestVersionColor, 1024));
                }
            }
        }
        this.decorations['latest_versions'] = {
            decoration_type: globals.latestVersionDecoration,
            decorations: decorations,
        };
    }

    async showAbandoned() {
        const decorations: vscode.DecorationOptions[] = [];
        const abandoned: abandoned[] = await (this.packageManager as Php).getAbandoned();

        for (const line of this.targets) {
            const thePackage = abandoned.find((pkg: abandoned) => pkg.package === line.package);
    
            if (thePackage) {
                decorations.push(this.decoration('abandoned', line["lineNumber"], this.abandonedColor, 1024));
            }
        }
        this.decorations['abandoned'] = {
            decoration_type: globals.abandonedDecoration,
            decorations: decorations,
        };
    }

    async showPackagesLinks() {
        const link = new Link;
        for (const line of this.targets) {
            const pkg: InstalledPackage = {
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

    private decoration(text: string, line: number, color: string, char: number): vscode.DecorationOptions {
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

    private applyDecorations(): void {
        for (const decorations of Object.values(this.decorations)) {
            this.editor.setDecorations(decorations.decoration_type, decorations.decorations);
        }
    }
}
