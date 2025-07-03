export interface PackageManager {
    getInstalled(packageName: string, line: string): Promise<any>
    getLockPath(): string
}
