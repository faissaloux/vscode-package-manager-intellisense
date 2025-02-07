import * as jsYaml from 'js-yaml';
import { LockParser } from '../interfaces/lock_parser';

export class PnpmLock implements LockParser {
    private content: {[key: string]: any};

    constructor(content: string) {
        // @ts-ignore
        this.content = jsYaml.load(content);
        this.appendVersions();

        return this;
    }

    dependencies(): {[key: string]: any} {
        return this.content.packages;
    }

    appendVersions(): void {
        Object.keys(this.content.packages).map(pkg => {
            let version = pkg.match(/\d+(\.\d+)+/);

            if (version) {
                this.content.packages[pkg]['version'] = version[0];
            }
        });
    }
}
