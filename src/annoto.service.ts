import { IAnnotoApi, IConfig } from '@annoto/widget-api';
import { PlaykitAnnotoPlugin } from './annoto';

export class PlaykitAnnotoService {
    constructor(private plugin: PlaykitAnnotoPlugin) {}
    
    getApi(): Promise<IAnnotoApi> {
        return this.plugin.annotoApi;
    }

    onSetup(setupHandle: (config: IConfig) => Promise<IConfig>): void {
        this.plugin.onSetup(setupHandle);
    }
}