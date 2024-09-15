export interface PackageManager {
    getInstalled(packageName: string): Promise<any>
    getLockPath(): string
}
