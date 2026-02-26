export interface LockParser {
    dependencies(): Record<string, any>
    lockVersion(): number | null
}
