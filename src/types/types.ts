export type InstalledPackage = {
    name: string,
    version: string,
    link?: string,
};

export type ComposerInstalledPackage = {
    name: string,
    version: string,
    source: {
        url: string,
    },
};

export type Line = {
    content: string,
    lineNumber: number,
};
