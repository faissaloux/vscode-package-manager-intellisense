import { outdated } from "../types/types";

export interface PythonPackageManagerInterface {
    getLatestVersions(): outdated[]|false;
    getName(): string;
    getLockPath(): string;
    isAlive(): boolean;
}