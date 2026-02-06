import { InstalledPackage, Language, outdated } from "../types/types";

export interface PackageManager {
    getInstalled(packageName: string, line: string): Promise<InstalledPackage>;
    getLockPath(): string;
    getName(): Language;
    getEditorFileName(): string;
    getLinkOfPackage(packageName: string): Promise<string>;
    getLatestVersions(): outdated[];
}
