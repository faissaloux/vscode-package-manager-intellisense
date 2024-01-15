import * as vscode from 'vscode';
import { Javascript } from './package_managers/javascript';
import { Php } from './package_managers/php';
import { Ruby } from './package_managers/ruby';

export class PackageManager {
    private editorFileName: string;
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
        } else if (this.editorFileName.endsWith('Gemfile')) {
            this.packageManager = 'ruby';
        }
        
        return this;
    }

    async getInstalled(packageName: string): Promise<any> {
        let installedPackage;

        if (this.packageManager === 'php') {
            installedPackage = await new Php(this.editorFileName).getInstalled(packageName);
        } else if (this.packageManager === 'javascript') {
            installedPackage = await new Javascript(this.editorFileName).getInstalled(packageName);
        }  else if (this.packageManager === 'ruby') {
            installedPackage = await new Ruby(this.editorFileName).getInstalled(packageName);
        }

        return installedPackage;
    }
}
