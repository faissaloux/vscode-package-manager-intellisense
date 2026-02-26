import type { LockParser } from "../interfaces/lock_parser";

export class ComposerLock implements LockParser {
    private content: Record<string, any>;

    constructor(content: string) {
        this.content = JSON.parse(content);

        return this;
    }

    dependencies(): Record<string, any> {
        return this.content.packages;
    }

    lockVersion(): null {
        return null;
    }
}
