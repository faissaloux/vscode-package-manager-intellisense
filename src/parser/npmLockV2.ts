export class NpmLockV2 {
    constructor(private readonly content: {[key: string]: any}) {
        return this;       
    }

    dependencies(): {[key: string]: any} {
        return this.content.dependencies;
    }
}
