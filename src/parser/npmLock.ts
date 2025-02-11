import { LockParser } from "../interfaces/lock_parser";
import { NpmLockV2 } from "./npmLockV2";
import { NpmLockV3 } from "./npmLockV3";

export class NpmLock implements LockParser {
    private content: {[key: string]: any};
    private lockfileVersion: number;

    constructor(content: string) {
        this.content = JSON.parse(content);
        this.lockfileVersion = this.content.lockfileVersion;

        return this;
    }

    dependencies(): {[key: string]: any} {
        if (this.lockfileVersion === 3) {
            return new NpmLockV3(this.content).dependencies();
        }

        return new NpmLockV2(this.content).dependencies();
    }

    lockVersion(): number {
        return this.lockfileVersion;
    }
}
