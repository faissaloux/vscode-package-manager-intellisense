import * as vscode from 'vscode';
import * as globals from '../util/globals';
import { PackageManager } from '../package_manager/package_manager';
import { Parser as GemfileParser } from '@faissaloux/gemfile';

export class Decorator {
    private readonly defaultVersion: string = 'n/a';
    private readonly color: string = 'grey';
    private readonly margin: string = '0 0 0 1rem';
    private readonly packagesToExclude: string[] = [
        'php',
    ];

    constructor (private readonly editor: vscode.TextEditor, private readonly packageManager: PackageManager) {
        return this;
    }

    async decorate() {
        let content = this.editor.document.getText();
        let packagesNames: string[] = [];
        let contentJson;

        if (this.packageManager["packageManager"] === "ruby") {
            let formatted: {[key: string]: string} = {};
            contentJson = new GemfileParser().file(this.packageManager["editorFileName"]).parse();
            contentJson = JSON.parse(contentJson);

            contentJson['dependencies'].forEach(( dependency: {[key: string]: string} ) => {
                formatted[dependency["name"]] = dependency["version"] ?? this.defaultVersion;
            });

            contentJson['dependencies'] = formatted;
        } else {
            contentJson = JSON.parse(content);
        }
    
        packagesNames = [
            ...Object.keys(contentJson['dependencies'] || {}),
            ...Object.keys(contentJson['devDependencies'] || {}),
            ...Object.keys(contentJson['require'] || {}),
            ...Object.keys(contentJson['require-dev'] || {}),
        ];

        const decorations: vscode.DecorationOptions[] = [];
    
        for (const packageName of packagesNames) {
            if (this.packagesToExclude.indexOf(packageName) !== -1) {
                continue;
            }

            let lines = this.getLines(this.editor.document, packageName);
            for (const line of lines) {
                let installedPackage = await this.packageManager.getInstalled(packageName);
                let version = this.defaultVersion;

                if(installedPackage?.version) {
                    version = `v${installedPackage?.version.replace('v', '')}`;
                }

                if (installedPackage !== null) {
                    decorations.push(this.decoration(version, line));
                }
            }
        }
    
        this.editor.setDecorations(globals.decorationType, decorations);
    }

    getLines(document: vscode.TextDocument, packageName: string): number[] {
        let lineNumbers: number[] = [];
        let lineCount = document.lineCount;
        
        for (let lineNumber: number = 0; lineNumber < lineCount; lineNumber++) {
            let lineText = document.lineAt(lineNumber).text;
            let regex = "";

            if (this.packageManager["packageManager"] === "ruby") {
                regex = 'gem "' + packageName + '"';
            } else {
                regex = '"' + packageName + '":';
            }

            if (lineText.match(regex)) {
                lineNumbers.push(lineNumber);
            }
        }
        
        return lineNumbers;
    }

    decoration(text: string, line: number): vscode.DecorationOptions {
        const range: vscode.Range = new vscode.Range(line, 1024, line, 1024);
        const renderOptions = {
            after: {
                contentText: text,
                color: this.color,
                margin: this.margin,
            }
        };

        return {range: range, renderOptions: renderOptions};
    }
}
