import * as yarnlockfile from '@yarnpkg/lockfile';
import * as jsYaml from 'js-yaml';

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
        return JSON.parse(content).dependencies;
    }

    yarn(content: string): {[key: string]: any} {
        return yarnlockfile.parse(content).object;
    }

    pnpm(content: string): {[key: string]: any} {
        // @ts-ignore
        return jsYaml.load(content).packages;
    }

    composer(content: string): {[key: string]: any} {
        return JSON.parse(content).packages;
    }

    rubygems(content: string)/*: {[key:string]: any}*/ {
        console.log("CONTENT: ");
        console.log(content);
    }
}
