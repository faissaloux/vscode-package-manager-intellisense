import * as yarnlockfile from '@yarnpkg/lockfile';
import { LockParser } from '../interfaces/lock_parser';

export class YarnLock implements LockParser {
    private content: {[key: string]: any};

    constructor(content: string) {
        this.content = yarnlockfile.parse(content);

        return this;
    }

    dependencies(): {[key: string]: any} {
        return this.content.object;
    }

    lockVersion(): null {
        return null;
    }
}
