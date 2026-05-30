import { BunLock } from './BunLock';
import { CargoLock } from './cargoLock';
import { ComposerLock } from './composerLock';
import { GemfileLock } from './gemfileLock';
import { NpmLock } from './npmLock';
import { PnpmLock } from './pnpmLock';
import { PoetryLock } from './poetryLock';
import { PubLock } from './PubLock';
import { UvLock } from './uvLock';
import { YarnLock } from './yarnLock';

export class Parser {
    private readonly parsers = {
        "npm": NpmLock,
        "yarn": YarnLock,
        "pnpm": PnpmLock,
        'bun': BunLock,
        "composer": ComposerLock,
        "rubygems": GemfileLock,
        "cargo": CargoLock,
        "poetry": PoetryLock,
        "uv": UvLock,
        "pub": PubLock,
    };

    constructor(private readonly packageManager: string) {
        return this;
    }

    parse(content: string): {'lockVersion': number | null, 'dependencies': any} {
        // @ts-ignore
        const lockParser = new this.parsers[this.packageManager](content);

        return {
            'lockVersion': lockParser.lockVersion(),
            'dependencies': lockParser.dependencies(),
        };
    }
}
