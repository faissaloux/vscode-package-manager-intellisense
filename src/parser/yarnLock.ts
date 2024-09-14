import * as yarnlockfile from '@yarnpkg/lockfile';

export class YarnLock {
    private content: {[key: string]: any};

    constructor(content: string) {
        this.content = yarnlockfile.parse(content);

        return this;   
    }

    dependencies(): {[key: string]: any} {
        return this.content.object;
    }
}
