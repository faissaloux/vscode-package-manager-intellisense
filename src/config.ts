import * as vscode from 'vscode';
import { DependenciesFile } from "./package_manager/package_manager";
import { type PackageManager } from './types/types';

export class Config {
    static PackageManagersFiles: Record<PackageManager, DependenciesFile> = {
        'npm': 'package.json',
        'yarn': 'package.json',
        'pnpm': 'package.json',
        'bun': 'package.json',
        'composer': 'composer.json',
        'bundler': 'Gemfile',
        'cargo': 'Cargo.toml',
        'poetry': 'pyproject.toml',
        'pub': 'pubspec.yaml',
    };

    static enabledPackageManagers(): DependenciesFile[] {
        const packagesFiles: DependenciesFile[] = [];

        Object.entries(Config.PackageManagersFiles).forEach(([packageManager, file]) => {
            if (vscode.workspace.getConfiguration().get(`package-manager-intellisense.${packageManager}.enable`) && !packagesFiles.includes(file)) {
                packagesFiles.push(file);
            }
        })

        return packagesFiles;
    }
}