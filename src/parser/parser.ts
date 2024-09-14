import { YarnLock } from './yarnLock';
import { ComposerLock } from './composerLock';
import { PnpmLock } from './pnpmLock';
import { GemfileLock } from './gemfileLock';
import { NpmLock } from './npmLock';

export class Parser {
    constructor(private readonly packageManager: string) {
        return this;        
    }

    parse(content: string): {[key: string]: any} {
        // @ts-ignore
        let parsed = this[this.packageManager](content);

        return parsed;
    }

    npm(content: string): {[key: string]: any} {
        return new NpmLock(content).dependencies();
    }

    yarn(content: string): {[key: string]: any} {
        return new YarnLock(content).dependencies();
    }

    pnpm(content: string): {[key: string]: any} {
        return new PnpmLock(content).dependencies();
    }

    composer(content: string): {[key: string]: any} {
        return new ComposerLock(content).dependencies();
    }

    rubygems(content: string): {[key:string]: any} {
        return new GemfileLock(content).dependencies();
    }
}
