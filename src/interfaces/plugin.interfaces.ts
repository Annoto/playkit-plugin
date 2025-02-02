import { IConfig } from '@annoto/widget-api';
import { IPlaykitBasePlugin } from './playkit.interfaces';

export interface IAnnotoPlaykitPlugin extends IPlaykitBasePlugin {
    readonly config: IAnnotoPlaykitPluginConfig;
}

export interface IAnnotoPlaykitPluginConfig extends Partial<IConfig> {
    /**
     * Widget bootstrap url
     * @default https://cdn.annoto.net/widget/latest/bootstrap.js
     */
    bootstrapUrl?: string;
    /**
     * if set to false, boot widget automatically with the configuration provided to the plugin via the player configuration
     * @default true
     */
    manualBoot?: boolean;
}