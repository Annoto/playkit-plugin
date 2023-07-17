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
     * if set to true, boot widget manually using the PlaykitAnnotoService.boot() method
     * by default widget boot is done automatically imideatly after plugin script is loaded
     * @default false
     */
    manualBoot?: boolean;
}