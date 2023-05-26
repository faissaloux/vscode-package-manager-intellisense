import * as vscode from 'vscode';
import { javascript } from './package_managers/javascript';
import { Php } from './package_managers/php';

export class PackageManager {
    private editorFileName: string;;
    private packageManager: string = '';

    constructor(private readonly editor: vscode.TextEditor) {
        this.editorFileName = this.editor.document.fileName;

        return this;
    }

    get(): this {
        if (this.editorFileName.endsWith('composer.json')){
            this.packageManager = 'php';
        } else if (this.editorFileName.endsWith('package.json')) {
            this.packageManager = 'javascript';
        }
        
        return this;
    }

    async getInstalled(packageName: string): Promise<any> {
        let installedPackage;

        if (this.packageManager === 'php') {
            installedPackage = await new Php(this.editorFileName).getInstalled(packageName);
        } else if (this.packageManager === 'javascript') {
            installedPackage = await new javascript(this.editorFileName).getInstalled(packageName);
        }
        
        return installedPackage;
    }
}
