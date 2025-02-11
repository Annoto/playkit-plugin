import { PlaykitAnnotoService } from './annoto.service';
import { PlaykitAnnotoPlugin } from './annoto';
import { BUILD_ENV } from './constants';

export { PlaykitAnnotoPlugin, PlaykitAnnotoService };
export { IAnnotoPlaykitPluginConfig, IAnnotoPlaykitPlugin } from './interfaces';

export const VERSION = BUILD_ENV.version;
export const NAME = BUILD_ENV.name;

try {
    const queryParamas = new URL((document.currentScript as HTMLScriptElement)?.src || '').searchParams;
    
    const autoBoot = queryParamas.get('auto_boot');
    if (autoBoot === 'true' || autoBoot === '1') {
        PlaykitAnnotoPlugin.AUTO_BOOT = true;
    }
} catch (err) {}

const pluginName: string = 'annoto';
KalturaPlayer.core.registerPlugin(pluginName, PlaykitAnnotoPlugin);
