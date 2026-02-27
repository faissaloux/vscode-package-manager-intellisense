import * as toml from '@iarna/toml';
import type { LockParser } from '../interfaces/lock_parser';

export class PoetryLock implements LockParser {
    private content: Record<string, any>;
    private lockfileVersion: number;

    constructor(content: string) {
        this.content = toml.parse(content);
        this.lockfileVersion = this.content.metadata['lock-version'];

        return this;
    }

    dependencies(): Record<string, any> {
        return this.content.package;
    }

    lockVersion(): number {
        return this.lockfileVersion;
    }
}
