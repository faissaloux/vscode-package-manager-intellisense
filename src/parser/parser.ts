import { YarnLock } from './yarnLock';
import { ComposerLock } from './composerLock';
import { PnpmLock } from './pnpmLock';
import { GemfileLock } from './gemfileLock';
import { NpmLock } from './npmLock';
import { BunLock } from './BunLock';

export class Parser {
    private readonly parsers = {
        "npm": NpmLock,
        "yarn": YarnLock,
        "pnpm": PnpmLock,
        'bun': BunLock,
        "composer": ComposerLock,
        "rubygems": GemfileLock,
    };

    constructor(private readonly packageManager: string) {
        return this;
    }

    parse(content: string): {[key: string]: any} {
        // @ts-ignore
        return new this.parsers[this.packageManager](content).dependencies();
    }
}
