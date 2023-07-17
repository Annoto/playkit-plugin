import { IAnnotoApi, IConfig } from '@annoto/widget-api';
import { PlaykitAnnotoPlugin } from './annoto';
import { IAnnotoPlaykitPluginConfig } from './interfaces';

export class PlaykitAnnotoService {
    constructor(private plugin: PlaykitAnnotoPlugin) {}
    
    get config(): IAnnotoPlaykitPluginConfig {
        return this.plugin.config;
    }

    getApi(): Promise<IAnnotoApi> {
        return this.plugin.annotoApi;
    }

    async boot(configUpdate?: Partial<IConfig>): Promise<IAnnotoApi> {
        return this.plugin.boot(configUpdate);
    }

    onSetup(setupHandle: (config: IConfig) => Promise<IConfig>): void {
        this.plugin.onSetup(setupHandle);
    }
}