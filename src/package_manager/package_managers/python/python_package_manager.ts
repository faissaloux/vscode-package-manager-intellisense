import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as vscode from 'vscode';

import { pathJoin } from '../../../util/globals';

export default abstract class PythonPackageManager {
  protected abstract readonly locks: string[];
  protected lockVersion: number = 0;
  protected abstract readonly outdatedPackagesCommand: string;
  protected projectDir: string = '';

  setProjectDirectory(dir: string): void {
    this.projectDir = dir;
  }

  setLockVersion(version: number): void {
    this.lockVersion = version;
  }

  isAlive(): boolean {
    for (const lockFile of this.locks) {
      const lockPath: string = pathJoin(
        path.dirname(vscode.window.activeTextEditor?.document.uri.fsPath ?? ''),
        lockFile,
      );

      if (fs.existsSync(lockPath)) {
        return true;
      }
    }

    return false;
  }

  getLockPath(): string {
    for (const lockFile of this.locks) {
      const lockPath: string = pathJoin(this.projectDir ?? '', lockFile);

      if (fs.existsSync(lockPath)) {
        return lockFile;
      }
    }

    return '';
  }

  getOutdatedPackages(): string {
    const outdatedResponse = cp.spawnSync(this.outdatedPackagesCommand, {
      cwd: this.projectDir,
      shell: true,
      encoding: 'utf8',
      timeout: 120000,
      maxBuffer: 50 * 1024 * 1024,
    });

    return outdatedResponse.stdout ?? '';
  }
}
