import * as toml from '@iarna/toml';
import { LockParser } from '../interfaces/lock_parser';

export class CargoLock implements LockParser {
    private content: {[key: string]: any};
    private lockfileVersion: number;

    constructor(content: string) {
        this.content = toml.parse(content);
        this.lockfileVersion = this.content.version;

        return this;
    }

    dependencies(): {[key: string]: any} {
        return this.content.package;
    }

    lockVersion(): number {
        return this.lockfileVersion;
    }
}
