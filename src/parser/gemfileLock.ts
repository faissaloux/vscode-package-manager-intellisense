import { LockParser as GemfileLockParser } from '@faissaloux/gemfile';
import { LockParser } from '../interfaces/lock_parser';

export class GemfileLock implements LockParser {
    private content: {[key: string]: any};

    constructor(content: string) {
        this.content = JSON.parse(new GemfileLockParser().text(content).parse());

        return this;
    }

    dependencies(): {[key: string]: any} {
        return this.content;
    }

    lockVersion(): null {
        return null;
    }
}
