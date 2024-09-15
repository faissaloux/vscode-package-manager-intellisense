import * as vscode from 'vscode';
import { Javascript } from './package_managers/javascript';
import { Php } from './package_managers/php';
import { Ruby } from './package_managers/ruby';

export class PackageManager {
    private editorFileName: string;
    private packageManager: string = '';
    private languagesPackagesFiles: {[key: string]: string} = {
        'php': 'composer.json',
        'javascript': 'package.json',
        'ruby': 'Gemfile',
    };
    private packageManagers = {
        'php': Php,
        'javascript': Javascript,
        'ruby': Ruby,
    };

    constructor(private readonly editor: vscode.TextEditor) {
        this.editorFileName = this.editor.document.fileName;

        return this;
    }

    get(): this {
        for (const [language, packagesFile] of Object.entries(this.languagesPackagesFiles)) {
            if (this.editorFileName.endsWith(packagesFile)){
                this.packageManager = language;
                break;
            }
        }

        return this;
    }

    async getInstalled(packageName: string): Promise<any> {
        // @ts-ignore
        return await new this.packageManagers[this.packageManager](this.editorFileName).getInstalled(packageName);
    }
}
