import type { LockParser } from "../interfaces/lock_parser";

export class NpmLockV3 implements LockParser {
    constructor(private readonly content: Record<string, any>) {
        return this;
    }

    dependencies(): Record<string, any> {
        const dependencies: Record<string, any> = {};

        for (const [name, details] of Object.entries(this.content.packages)) {
            dependencies[name.replace("node_modules/", "")] = details;
        }

        return dependencies;
    }

    lockVersion(): number {
        return 3;
    }
}
