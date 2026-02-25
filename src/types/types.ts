export type Language =
    | 'php'
    | 'javascript'
    | 'ruby'
    | 'rust'
    | 'python'
    | 'dart'
    ;

export type PackageManager =
    | 'npm'
    | 'yarn'
    | 'pnpm'
    | 'bun'
    | 'composer'
    | 'bundler'
    | 'cargo'
    | 'poetry'
    | 'pub'
    ;

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
    package: string,
    lineNumber: number,
};

export type outdated = {
    package: string,
    version: string,
    latestVersion: string,
};