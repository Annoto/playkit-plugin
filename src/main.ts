import { PlaykitAnnotoService } from './annoto.service';
import { PlaykitAnnotoPlugin } from './annoto';
import { BUILD_ENV, pluginName } from './constants';
import { IGlobal } from './interfaces/global';
import { autoBoot } from './autoboot';

export { PlaykitAnnotoPlugin, PlaykitAnnotoService };
export { IAnnotoPlaykitPluginConfig, IAnnotoPlaykitPlugin } from './interfaces';

export const VERSION = BUILD_ENV.version;
export const NAME = BUILD_ENV.name;
const global = window as unknown as IGlobal;

let queryParams: URLSearchParams | undefined;
try {
    queryParams = new URL((document.currentScript as HTMLScriptElement)?.src || '').searchParams;

    const ab = queryParams.get('auto_boot');
    if (ab === 'true' || ab === '1' || global.NN_PLAYKIT_AUTO_BOOT) {
        PlaykitAnnotoPlugin.AUTO_BOOT = true;
    }
} catch (err) {}

KalturaPlayer.core.registerPlugin(pluginName, PlaykitAnnotoPlugin);

if (PlaykitAnnotoPlugin.AUTO_BOOT) {
    setTimeout(() => autoBoot(queryParams));
}
