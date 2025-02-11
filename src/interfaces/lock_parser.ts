export interface LockParser {
    dependencies(): {[key: string]: any}
    lockVersion(): number | null
}
