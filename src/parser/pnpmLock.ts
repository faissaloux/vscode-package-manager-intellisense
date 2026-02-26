import * as jsYaml from 'js-yaml';
import type { LockParser } from '../interfaces/lock_parser';

export class PnpmLock implements LockParser {
    private content: Record<string, any>;
    private lockfileVersion: number;

    constructor(content: string) {
        // @ts-ignore
        this.content = jsYaml.load(content);
        this.lockfileVersion = this.content.lockfileVersion;
        this.appendVersions();

        return this;
    }

    dependencies(): Record<string, any> {
        return this.content.packages;
    }

    lockVersion(): number {
        return this.lockfileVersion;
    }

    appendVersions(): void {
        Object.keys(this.content.packages).map(pkg => {
            const version = pkg.match(/\d+(\.\d+)+/);

            if (version) {
                this.content.packages[pkg]['version'] = version[0];
            }
        });
    }
}
