import * as vscode from 'vscode';
import { InstalledPackage, Language, Line, outdated } from "../types/types";

export interface PackageManager {
    getInstalled(packageName: string, line: string): Promise<InstalledPackage>;
    getLockPath(): string;
    getName(): Language;
    getEditorFileName(): string;
    getLinkOfPackage(packageName: string): Promise<string>;
    getLatestVersions(): outdated[];
    getOutdatedPackages(): string;
    getPackagesNames(content: string): Set<string>;
    getLines(document: vscode.TextDocument, packageName: string): Line[];
    isExcluded(packageName: string): boolean;
}
