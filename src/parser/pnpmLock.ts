import * as jsYaml from 'js-yaml';
import { LockParser } from '../interfaces/lock_parser';

export class PnpmLock implements LockParser {
    private content: {[key: string]: any};

    constructor(content: string) {
        // @ts-ignore
        this.content = jsYaml.load(content);

        return this;
    }

    dependencies(): {[key: string]: any} {
        return this.content.packages;
    }
}
