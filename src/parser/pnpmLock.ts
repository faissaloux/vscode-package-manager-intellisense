import * as jsYaml from 'js-yaml';

export class PnpmLock {
    private content: {[key: string]: any};

    constructor(content: string) {
        // @ts-ignore
        this.content = jsYaml.load(content);

        return this;
    }

    dependencies(): {[key: string]: any} {
        return this.content.packages;
    }
}
