import { JavascriptPackageManagerInterface } from "../../../interfaces/javascript_package_manager";
import JavascriptPackageManager from './javascript_package_manager';

export class Pnpm extends JavascriptPackageManager implements JavascriptPackageManagerInterface {
    protected readonly locks = ['pnpm-lock.yaml'];
    protected readonly startsWith: {[version: string | number]: string} = {
        /* eslint-disable @typescript-eslint/naming-convention */
        '5.3': '/packageName/',
        '6': '/packageName@',
        '9': 'packageName@',
        /* eslint-enable */
    };

    getName(): string {
        return 'pnpm';
    }
}
