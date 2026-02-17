import { outdated } from "../types/types";

export interface JavascriptPackageManagerInterface {
    getLatestVersions(): outdated[]|false;
    getName(): string;
    getLockPath(): string;
    lockPackageStartsWith(packageName: string, version: string): string;
    setLockVersion(version: number): void;
    isAlive(): boolean;
    getOutdatedPackages(): string;
}