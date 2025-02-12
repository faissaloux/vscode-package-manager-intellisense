import { LockParser } from "../interfaces/lock_parser";

export class NpmLockV2 implements LockParser {
    constructor(private readonly content: {[key: string]: any}) {
        return this;
    }

    dependencies(): {[key: string]: any} {
        return this.content.dependencies;
    }

    lockVersion(): number {
        return 2;
    }
}
