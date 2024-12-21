import * as vscode from 'vscode';
import { Javascript } from './package_managers/javascript';
import { Php } from './package_managers/php';
import { Ruby } from './package_managers/ruby';
import path = require('path');
import { LanguagePackageManager } from './language_package_manager';

type Language = 'php' | 'javascript' | 'ruby';
type DependenciesFile = 'composer.json' | 'package.json' | 'Gemfile';

export class PackageManager {
    private editorFileName: string;
    private packageManager: string = '';
    private languagesPackagesFiles: {[key in Language]: DependenciesFile} = {
        'php': 'composer.json',
        'javascript': 'package.json',
        'ruby': 'Gemfile',
    };
    private packageManagers: {[key in Language]: typeof LanguagePackageManager} = {
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
        return await new this.packageManagers[this.packageManager](path.dirname(this.editorFileName)).getInstalled(packageName);
    }
}
