import { LockParser } from "../interfaces/lock_parser";

export class NpmLockV3 implements LockParser {
    constructor(private readonly content: {[key: string]: any}) {
        return this;
    }

    dependencies(): {[key: string]: any} {
        const dependencies: {[key: string]: any} = {};

        for (const [name, details] of Object.entries(this.content.packages)) {
            dependencies[name.replace("node_modules/", "")] = details;
        }

        return dependencies;
    }

    lockVersion(): number {
        return 3;
    }
}
