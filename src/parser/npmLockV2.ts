import type { LockParser } from "../interfaces/lock_parser";

export class NpmLockV2 implements LockParser {
    constructor(private readonly content: Record<string, any>) {
        return this;
    }

    dependencies(): Record<string, any> {
        return this.content.dependencies;
    }

    lockVersion(): number {
        return 2;
    }
}
