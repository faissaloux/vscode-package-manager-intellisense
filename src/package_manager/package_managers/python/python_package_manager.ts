import * as fs from 'fs';
import { pathJoin, rootPath } from '../../../util/globals';
import * as cp from 'child_process';

export default abstract class PythonPackageManager {
    protected abstract readonly locks: string[];
    protected lockVersion: number = 0;
    protected abstract readonly outdatedPackagesCommand: string;

    setLockVersion(version: number): void {
        this.lockVersion = version;
    }

    isAlive(): boolean {
        for (const lockFile of this.locks) {
            const lockPath: string = pathJoin(rootPath ?? '', lockFile);

            if (fs.existsSync(lockPath)) {
                return true;
            }
        }

        return false;
    }

    getLockPath(): string {
        for (const lockFile of this.locks) {
            const lockPath: string = pathJoin(rootPath ?? '', lockFile);

            if (fs.existsSync(lockPath)) {
                return lockFile;
            }
        };

        return '';
    }

    getOutdatedPackages(): string {
        let outdatedResponse: string;
        try {
            outdatedResponse = cp.execSync(this.outdatedPackagesCommand, {
                cwd: rootPath,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
        } catch (error: any) {
            if (error.stdout) {
                outdatedResponse = error.stdout.toString();
            } else {
                return '';
            }
        }

        return outdatedResponse;
    }
}