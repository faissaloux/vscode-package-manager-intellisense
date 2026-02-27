import type * as vscode from 'vscode';
import { Dart } from './package_managers/dart';
import { Javascript } from './package_managers/javascript';
import type { Language } from '../types/types';
import type { LanguagePackageManager } from './language_package_manager';
import type { PackageManager as PackageManagerInterface } from '../interfaces/package_manager';
import { Php } from './package_managers/php';
import { Python } from './package_managers/python';
import { Ruby } from './package_managers/ruby';
import { Rust } from './package_managers/rust';

export type DependenciesFile = 'composer.json' | 'package.json' | 'Gemfile' | 'Cargo.toml' | 'pyproject.toml' | 'pubspec.yaml';

export class PackageManager {
    private editorFileName: string;
    private languagesPackagesFiles: Record<Language, DependenciesFile> = {
        'php': 'composer.json',
        'javascript': 'package.json',
        'ruby': 'Gemfile',
        'rust': 'Cargo.toml',
        'python': 'pyproject.toml',
        'dart': 'pubspec.yaml',
    };
    private packageManagers: Record<Language, typeof LanguagePackageManager> = {
        'php': Php,
        'javascript': Javascript,
        'ruby': Ruby,
        'rust': Rust,
        'python': Python,
        'dart': Dart,
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
