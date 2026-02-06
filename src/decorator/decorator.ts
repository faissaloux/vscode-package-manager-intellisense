import * as vscode from 'vscode';
import * as toml from '@iarna/toml';
import * as globals from '../util/globals';
import { PackageManager as PackageManagerInterface } from '../interfaces/package_manager';
import { Parser as GemfileParser } from '@faissaloux/gemfile';
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
        let packagesNames: Set<string>;
        let contentJson;

        if (this.packageManager.getName() === "ruby") {
            let formatted: {[key: string]: string} = {};
            contentJson = new GemfileParser().file(this.packageManager.getEditorFileName()).parse();
            contentJson = JSON.parse(contentJson);

            contentJson['dependencies'].forEach(( dependency: {[key: string]: string} ) => {
                formatted[dependency["name"]] = dependency["version"] ?? this.defaultVersion;
            });

            contentJson['dependencies'] = formatted;
        } else if (this.packageManager.getName() === "rust") {
            contentJson = toml.parse(content);
        } else if (this.packageManager.getName() === "python") {
            let formatted: {[key: string]: string} = {};

            contentJson = toml.parse(content);

            // @ts-ignore
            contentJson['project']['dependencies'].map((dependency: string) => {
                const [dep, version] = dependency.replace(/\[.*?\]/g, '').split(' ');

                formatted[dep] = version;
            });

            contentJson['dependencies'] = formatted;
        } else {
            contentJson = JSON.parse(content);
        }

        packagesNames = new Set<string>([
            ...Object.keys(contentJson['dependencies'] || {}),
            ...Object.keys(contentJson['devDependencies'] || {}),
            ...Object.keys(contentJson['require'] || {}),
            ...Object.keys(contentJson['require-dev'] || {}),
            ...Object.keys(contentJson['conflict'] || {}),
            ...Object.keys(contentJson['dev-dependencies'] || {}),
        ]);

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

            let lines: Line[] = this.getLines(this.editor.document, packageName);
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

    getLines(document: vscode.TextDocument, packageName: string): Line[] {
        let lines: Line[] = [];
        let lineCount = document.lineCount;

        for (let lineNumber: number = 0; lineNumber < lineCount; lineNumber++) {
            let lineText = document.lineAt(lineNumber).text;
            let regex = "";

            if (this.packageManager.getName() === "ruby") {
                regex = 'gem "' + packageName + '"';
            } else if (this.packageManager.getName() === "rust") {
                regex = packageName + ' ';
            } else if (this.packageManager.getName() === "python") {
                regex = '^\\s*"' + packageName + '(?:\\[[a-zA-Z,]+\\])?\\s\\([^)]+\\)';
            } else {
                regex = '"' + packageName + '": "';
            }

            if (lineText.match(new RegExp(regex))) {
                lines.push({content: lineText, package: packageName, lineNumber});
            }
        }

        this.targets.push(...lines);

        return lines;
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
