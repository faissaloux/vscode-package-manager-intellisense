import * as jsYaml from 'js-yaml';
import { LockParser } from '@faissaloux/gemfile';
import { NpmLockV2 } from './npmLockV2';
import { NpmLockV3 } from './npmLockV3';
import { YarnLock } from './yarnLock';
import { ComposerLock } from './composerLock';

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
        const parsed: {[key: string]: any} = JSON.parse(content);
        const lockfileVersion = parsed.lockfileVersion;

        if (lockfileVersion === 3) {
            return new NpmLockV3(parsed).dependencies();
        }

        return new NpmLockV2(parsed).dependencies();
    }

    yarn(content: string): {[key: string]: any} {
        return new YarnLock(content).dependencies();
    }

    pnpm(content: string): {[key: string]: any} {
        // @ts-ignore
        return jsYaml.load(content).packages;
    }

    composer(content: string): {[key: string]: any} {
        return new ComposerLock(content).dependencies();
    }

    rubygems(content: string): {[key:string]: any} {
        return JSON.parse(new LockParser().text(content).parse());
    }
}
