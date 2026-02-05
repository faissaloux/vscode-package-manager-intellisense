import { outdated } from "../../../types/types";

export interface JsPkgManager {
    getLatestVersions(): outdated[];
}