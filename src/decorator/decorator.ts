import * as vscode from 'vscode';
import * as globals from '../util/globals';
import { PackageManager } from '../package_manager/package_manager';

export class Decorator {
    defaultVersion: string = 'n/a';

    constructor (private readonly editor: vscode.TextEditor, private readonly packageManager: PackageManager) {
        return this;
    }

    async decorate() {
        let content = this.editor.document.getText();
        let contentJson = JSON.parse(content);
    
        const packagesNames: string[] = [
            ...Object.keys(contentJson['dependencies'] || {}),
            ...Object.keys(contentJson['devDependencies'] || {}),
            ...Object.keys(contentJson['require'] || {}),
            ...Object.keys(contentJson['require-dev'] || {}),
        ];
    
        const decorations: vscode.DecorationOptions[] = [];
    
        for (const packageName of packagesNames) {
            let lines = this.getLines(this.editor.document, packageName);
            for (const line of lines) {
                let installedPackage = await this.packageManager.getInstalled(packageName);
                let version = this.defaultVersion;

                if(installedPackage?.version) {
                    version = installedPackage?.version;
                }

                decorations.push(this.decoration(version, line));
            }
        }
    
        this.editor.setDecorations(globals.decorationType, decorations);
    }

    getLines(document: vscode.TextDocument, packageName: string): number[] {
        let lineNumbers: number[] = [];
        let lineCount = document.lineCount;
        
        for (let lineNumber: number = 0; lineNumber < lineCount; lineNumber++) {
            let lineText = document.lineAt(lineNumber).text;
            let regex = '"' + packageName + '":';

            if (lineText.match(regex)) {
                lineNumbers.push(lineNumber);
            }
        }
        
        return lineNumbers;
    }

    decoration(text: string, line: number): vscode.DecorationOptions {
        const color: string = 'grey';
        const margin: string = '0 0 0 1rem';
        const range: vscode.Range = new vscode.Range(line, 1024, line, 1024);
        const renderOptions = {
            after: {
                contentText: text,
                color: color,
                margin: margin,
            }
        };

        return {range: range, renderOptions: renderOptions};
    }
}
