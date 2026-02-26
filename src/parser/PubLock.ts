import * as jsYaml from 'js-yaml';
import type { LockParser } from '../interfaces/lock_parser';

export class PubLock implements LockParser {
    private content: Record<string, any>;

    constructor(content: string) {
        // @ts-ignore
        this.content = jsYaml.load(content);
        this.appendVersions();

        return this;
    }

    dependencies(): Record<string, any> {
        return this.content.packages;
    }

    lockVersion(): null {
        return null;
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
