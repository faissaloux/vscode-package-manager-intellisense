import * as yarnlockfile from '@yarnpkg/lockfile';
import type { LockParser } from '../interfaces/lock_parser';

export class YarnLock implements LockParser {
    private content: Record<string, any>;

    constructor(content: string) {
        this.content = yarnlockfile.parse(content);

        return this;
    }

    dependencies(): Record<string, any> {
        return this.content.object;
    }

    lockVersion(): null {
        return null;
    }
}
