import { LockParser } from '@faissaloux/gemfile';

export class GemfileLock {
    private content: {[key: string]: any};

    constructor(content: string) {
        this.content = JSON.parse(new LockParser().text(content).parse());

        return this;   
    }

    dependencies(): {[key: string]: any} {
        return this.content;
    }
}
