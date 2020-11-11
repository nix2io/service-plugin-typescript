import { ServicePlugin } from '@nix2/service-core';
import { TypescriptPlugin } from '.';

/**
 * Return the plugin.
 * @returns {ServicePlugin} TS Plugin.
 */
export const getPlugin = (): ServicePlugin => TypescriptPlugin;
