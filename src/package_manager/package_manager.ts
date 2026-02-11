import * as vscode from 'vscode';
import { Javascript } from './package_managers/javascript';
import { Php } from './package_managers/php';
import { Ruby } from './package_managers/ruby';
import { LanguagePackageManager } from './language_package_manager';
import { PackageManager as PackageManagerInterface } from '../interfaces/package_manager';
import { Rust } from './package_managers/rust';
import { Language } from '../types/types';
import { Python } from './package_managers/python';

export type DependenciesFile = 'composer.json' | 'package.json' | 'Gemfile' | 'Cargo.toml' | 'pyproject.toml';

export class PackageManager {
    private editorFileName: string;
    private languagesPackagesFiles: {[key in Language]: DependenciesFile} = {
        'php': 'composer.json',
        'javascript': 'package.json',
        'ruby': 'Gemfile',
        'rust': 'Cargo.toml',
        'python': 'pyproject.toml',
    };
    private packageManagers: {[key in Language]: typeof LanguagePackageManager} = {
        'php': Php,
        'javascript': Javascript,
        'ruby': Ruby,
        'rust': Rust,
        'python': Python,
    };

    constructor(private readonly editor: vscode.TextEditor) {
        this.editorFileName = this.editor.document.fileName;

        return this;
    }

    get(): PackageManagerInterface | null {
        let thePackageManager: PackageManagerInterface | null = null;
        for (const [language, packagesFile] of Object.entries(this.languagesPackagesFiles)) {
            if (this.editorFileName.endsWith(packagesFile)){
                // @ts-ignore
                thePackageManager =  new this.packageManagers[language](this.editorFileName);
                break;
            }
        }

        return thePackageManager;
    }
}
