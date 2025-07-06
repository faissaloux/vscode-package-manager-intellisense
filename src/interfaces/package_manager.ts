import { InstalledPackage } from "../types/types"

export interface PackageManager {
    getInstalled(packageName: string, line: string): Promise<InstalledPackage|undefined>
    getLockPath(): string
}
