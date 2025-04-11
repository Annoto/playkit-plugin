import { IAnnotoPlaykitPluginConfig, IGlobal, IPlaykitPlayer } from './interfaces';
import { pluginName } from './constants';
import { ThemeType } from '@annoto/widget-api';

const global = window as unknown as IGlobal;

const findKalturaPlayer = (): IPlaykitPlayer | null => {
    const playkitPlayers: Record<string, IPlaykitPlayer> = (KalturaPlayer as any).getPlayers();
    const playerId = Object.keys(playkitPlayers).find((key) => key === 'kplayer') || Object.keys(playkitPlayers)[0];
    if (!playerId) {
        return null;
    }
    return playkitPlayers[playerId];
};

const loadPlugin = (config: IAnnotoPlaykitPluginConfig): boolean => {
    const player = findKalturaPlayer();
    if (!player) {
        return false;
    }
    if (player.plugins[pluginName]) {
        return true;
    }
    player.configure({
        plugins: {
            [pluginName]: config,
        },
    });

    if (!player.plugins[pluginName]) {
        // manualy load the plugin by mimicking _configureOrLoadPlugins needed logic
        // https://github.com/kaltura/kaltura-player-js/blob/master/src/kaltura-player.ts#L971C11-L971C34
        const pluginManager = player._pluginManager;
        pluginManager.load(pluginName, player, config);
        const plugin = pluginManager.get(pluginName)!;
        if (plugin?.getUIComponents) {
            (plugin?.getUIComponents() || []).forEach((c) => player.ui.addComponent(c));
        }
        if (plugin?.loadMedia) {
            plugin.loadMedia();
        }

        KalturaPlayer.core.utils.Object.mergeDeep(player._pluginsConfig, plugin.config);
    }
    return true;
};

export const autoBoot = (searchParams?: URLSearchParams): void => {
    const clientId = global.NN_PLAYKIT_API_KEY || searchParams?.get('api_key');
    if (!clientId) {
        return;
    }
    const region = global.NN_PLAYKIT_REGION || searchParams?.get('region');
    const theme = global.NN_PLAYKIT_THEME || (searchParams?.get('theme') as ThemeType);

    const config: IAnnotoPlaykitPluginConfig = {
        clientId,
    };
    if (region) {
        config.backend = {
            domain: `${region}.annoto.net`,
        };
    }
    if (theme) {
        config.ux = {
            theme,
        };
    }

    const load = (): void => {
        try {
            if (loadPlugin(config)) {
                return;
            }
            setTimeout(load, 200);
        } catch (err) {
            console.error('Error loading Annoto plugin:', err);
        }
    };
    load();
};
