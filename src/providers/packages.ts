import * as vscode from 'vscode';
import * as yarnlockfile from '@yarnpkg/lockfile';
import * as jsYaml from 'js-yaml';

export class Packages {
    rootPath: string;
    packageManager: string = 'npm';
    locks: {[key: string]: string} = {
        'npm': 'package-lock.json',
        'yarn': 'yarn.lock',
        'pnpm': 'pnpm-lock.yaml',
    };
    startsWith: {[key: string]: string} = {
        'npm': 'packageName',
        'yarn': 'packageName@',
        'pnpm': '/packageName/',
    }

    constructor(packageJsonFilePath: string) {
        this.rootPath = packageJsonFilePath.replace('package.json', '');
    }
    
    async getInstalled(packageName: string): Promise<any> {
        const lockPath = await this.getLockPath();
        const lockFile = vscode.Uri.file(lockPath);
        const lockFileContent = await vscode.workspace.fs.readFile(lockFile);

        const installedPackages = this.parse(lockFileContent.toString());

        if (this.packageManager == 'pnpm') {
            this.appendVersion(installedPackages);
        }
        
        return Object.entries(installedPackages).find(([title, details]) => title.startsWith(this.lockPackageStartsWith(packageName)))?.[1];
    }

    async getLockPath(): Promise<string> {
        this.packageManager = await this.getPackageManager();

        return this.rootPath + this.locks[this.packageManager];
    }

    async getPackageManager(): Promise<string> {
        for (const lock in this.locks) {
            let lockFile = vscode.Uri.file(this.rootPath + this.locks[lock]);
            try{
                await vscode.workspace.fs.readFile(lockFile);

                return lock
            } catch (error) {}
        }
        return Object.keys(this.locks)[0];
    }

    lockPackageStartsWith(packageName: string): string {
        return this.startsWith[this.packageManager].replace('packageName', packageName);
    }

    parse(content: string): {[key: string]: any} {
        let parsed;

        if (this.packageManager === 'npm') {
            parsed = JSON.parse(content).dependencies;

            return parsed;
        } else if (this.packageManager === 'yarn') {
            parsed = yarnlockfile.parse(content).object;
        } else {
            parsed = jsYaml.load(content).packages;
        }

        return parsed;
    }

    appendVersion(packages: {[key: string]: any}) {
        for ( const pkg in packages) {
            let version = pkg.match(/\d+(\.\d+)+/);

            if (version) {
                packages[pkg]['version'] = version[0];
            }
        }
    }
}
