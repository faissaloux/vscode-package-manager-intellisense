import * as vscode from 'vscode';

export class Link {
    links: vscode.DocumentLink[] = [];
    suppportedFiles = ["composer.json"];

    addPackageLink(pkg: any, line: {content: string, lineNumber: number}): void {
        const link = new vscode.DocumentLink(
            new vscode.Range(
                new vscode.Position(line["lineNumber"], line["content"].indexOf(pkg.name)),
                new vscode.Position(line["lineNumber"], line["content"].indexOf(pkg.name) + pkg.name.length)
            ),
            vscode.Uri.parse(pkg.source.url),
        );

        this.links.push(link);
    }

    registerLinks() {
        vscode.languages.registerDocumentLinkProvider({scheme: 'file'}, {provideDocumentLinks: (document) => {
            const fileName = document.uri.path.split('/').pop();

            if (fileName && this.suppportedFiles.includes(fileName)) {
                return this.links;
            }
        }});
    }
}
