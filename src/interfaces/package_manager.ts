interface PackageManager {
    rootPath: string;
    getInstalled(packageName: string): Promise<any>
    getLockPath(): Promise<string>
}
