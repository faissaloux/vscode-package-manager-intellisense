import { LockParser } from "../interfaces/lock_parser";

export class BunLock implements LockParser {
    private content: {[key: string]: any};

    constructor(content: string) {
        content = this.removeTrailingCommas(content);
        this.content = JSON.parse(content);
        this.appendVersions();

        return this;
    }

    dependencies(): {[key: string]: any} {
        return this.content.packages;
    }

    lockVersion(): null {
        return null;
    }

    removeTrailingCommas(content: string): string {
        const regex = /\,(?!\s*?[\{\[\"\'\w])/g;

        return content.replace(regex, '');
    }

    appendVersions(): void {
        Object.keys(this.content.packages).map(pkg => {
            const version = this.content.packages[pkg][0].split('@').at(-1);
            this.content.packages[pkg]['version'] = version;
        });
    }
}
