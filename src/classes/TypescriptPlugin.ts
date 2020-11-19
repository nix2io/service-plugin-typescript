import { MakeFileType, Service, ServicePlugin } from '@nix2/service-core';

import { TypescriptService } from '..';

/**
 * Class to represent a TS plugin.
 * @class TypescriptPlugin
 */
export default class TypescriptPlugin extends ServicePlugin {
    static NAME = 'typescript';
    static LABEL = 'Typescript';

    /**
     * Return the services for the TS Plugin.
     * @function getServices
     * @memberof TypescriptPlugin
     * @static
     * @returns {typeof Service[]} TS Service.
     */
    static getServices(): typeof Service[] {
        return [TypescriptService];
    }

    /**
     * Return the files that can be created with the `make` command in the CLI.
     * @function getMakeFiles
     * @memberof TypescriptPlugin
     * @static
     * @returns {MakeFileType[]} List of make files.
     */
    static getMakeFiles(): MakeFileType[] {
        return super.getMakeFiles().concat([
            {
                name: 'package',
                file: 'package.json',
                method: TypescriptService.prototype.createPackageFile,
            },
            {
                name: 'eslint',
                file: '.eslintrc.json',
                method: TypescriptService.prototype.createESLintConfig,
            },
            {
                name: 'tsconfig',
                file: 'tsconfig.json',
                method: TypescriptService.prototype.createTSConfig,
            },
        ]);
    }
}
