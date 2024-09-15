import { LockParser } from "../interfaces/lock_parser";

export class ComposerLock implements LockParser {
    private content: {[key: string]: any};

    constructor(content: string) {
        this.content = JSON.parse(content);

        return this;
    }

    dependencies(): {[key: string]: any} {
        return this.content.packages;
    }
}
