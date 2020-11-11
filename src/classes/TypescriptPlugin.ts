import { Service, ServicePlugin } from '@nix2/service-core';
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
     * @static
     * @returns {typeof Service[]} TS Service.
     */
    static getServices(): typeof Service[] {
        return [TypescriptService];
    }
}
