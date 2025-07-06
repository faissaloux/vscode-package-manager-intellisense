import * as vscode from 'vscode';
import { InstalledPackage } from '../types/types';

export class Link {
    private registered: boolean = false;
    private links: vscode.DocumentLink[] = [];
    private suppportedFiles = ["composer.json"];

    constructor() {
        this.links = [];
    }

    addPackageLink(pkg: InstalledPackage, line: {content: string, lineNumber: number}): void {
        if (!pkg.link) {
            return;
        }

        const link = new vscode.DocumentLink(
            new vscode.Range(
                new vscode.Position(line["lineNumber"], line["content"].indexOf(pkg.name)),
                new vscode.Position(line["lineNumber"], line["content"].indexOf(pkg.name) + pkg.name.length)
            ),
            vscode.Uri.parse(pkg.link),
        );

        this.links.push(link);
    }

    registerLinks() {
        vscode.languages.registerDocumentLinkProvider({scheme: 'file'}, {provideDocumentLinks: (document) => {
            const fileName = document.uri.path.split('/').pop();

            if (!this.registered && fileName && this.suppportedFiles.includes(fileName)) {
                this.registered = true;

                return this.links;
            }
        }});
    }
}
