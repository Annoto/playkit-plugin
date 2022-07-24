import { PlaykitAnnotoService } from './annoto.service';
import { PlaykitAnnotoPlugin } from './annoto';
import { BUILD_ENV } from './constants';

export { PlaykitAnnotoPlugin, PlaykitAnnotoService };
export { IAnnotoPlaykitPluginConfig, IAnnotoPlaykitPlugin } from './interfaces';

export const VERSION = BUILD_ENV.version;
export const NAME = BUILD_ENV.name;

const pluginName: string = 'annoto';
KalturaPlayer.core.registerPlugin(pluginName, PlaykitAnnotoPlugin);
