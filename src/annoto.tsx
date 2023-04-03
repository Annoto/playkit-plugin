import {
    IConfig,
    IAnnotoApi,
    Annoto as AnnotoMain,
    IPlayerConfig,
    IWidgetConfig,
} from '@annoto/widget-api';
import { BasePlugin } from 'kaltura-player-js';
import {
    IAnnotoPlaykitPlugin,
    IAnnotoPlaykitPluginConfig,
    IPlaykitPlayer,
    PlaykitRemoveComponentHandlerType,
} from './interfaces';
import { BUILD_ENV } from './constants';
import { AnnotoTimelineComponent } from './components';
import { PlaykitPlayerAdaptor } from './adaptor';
import { PlaykitAnnotoService } from './annoto.service';

import './style.scss';

const h = (KalturaPlayer.ui as any).h;

declare const Annoto: AnnotoMain;

export class PlaykitAnnotoPlugin extends (BasePlugin as any) implements IAnnotoPlaykitPlugin {
    readonly config!: IAnnotoPlaykitPluginConfig;
    readonly player!: IPlaykitPlayer;
    readonly logger!: KalturaPlayerTypes.Logger;
    readonly eventManager!: KalturaPlayerTypes.EventManager;
    private awaitBootstrap: Promise<void>;
    private bootstrapDone!: () => void;
    private awaitBoot: Promise<void>;
    private bootDone!: () => void;
    private adaptor: PlaykitPlayerAdaptor;
    private service: PlaykitAnnotoService;
    private widgetConfig: IConfig;
    private widgetApi?: IAnnotoApi;
    private isWidgetBooted = false;
    private containerEl: HTMLElement;
    private removeHandlers: PlaykitRemoveComponentHandlerType[] = [];
    private onSetupHandler?: (config: IConfig) => Promise<IConfig>;
    // private sidePanelItemId?: number;

    static defaultConfig: IAnnotoPlaykitPluginConfig = {};
    static isValid(player: IPlaykitPlayer): boolean {
        return true;
    }

    constructor(name: string, player: IPlaykitPlayer, { bootstrapUrl, ...config}: IAnnotoPlaykitPluginConfig) {
        super(name, player, { bootstrapUrl, ...config });
        this.logger.debug('constructor');
        this.awaitBootstrap = new Promise((resolve) => {
            this.bootstrapDone = resolve;
        });
        this.awaitBoot = new Promise((resolve) => {
            this.bootDone = resolve;
        });
        this.containerEl = player.getView().closest('.kaltura-player-container')!;
        this.adaptor = new PlaykitPlayerAdaptor(player, this);
        this.service = new PlaykitAnnotoService(this);

        const playerConfig: IPlayerConfig = {
            type: 'custom',
            element: this.containerEl,
            adaptorApi: this.adaptor,
        };
        const baseWidgetConfig: Partial<IWidgetConfig> = {
            timeline: {
                overlay: true,
            },
            features: {},
        };
        const baseConfig: IConfig = {
            widgets: [baseWidgetConfig as IWidgetConfig],
            hooks: {
                setup: this.setupHookHandle,
            }
        };
        
        this.widgetConfig = KalturaPlayer.core.utils.Object.mergeDeep({}, config || {}, baseConfig);
        this.widgetConfig.widgets[0].player = playerConfig;

        this.player.registerService('annoto', this.service);
        this.init();
    }

    getName(): string {
        return super.getName();
    }
    dispatchEvent(name: string, payload?: any): void {
        return super.dispatchEvent(name, payload);
    }
    updateConfig({ bootstrapUrl, clientId, ...update }: Partial<IAnnotoPlaykitPluginConfig>): void {
        super.updateConfig(update);
    }

    get ready(): Promise<void> {
        // called multiple times on load and on each play
        return this.asyncReady();
    }

    reset(): void {

    }

    destroy(): void {

    }

    loadMedia(): void {
        for (const remove of this.removeHandlers) {
            remove();
        }
        this.removeHandlers = [];

        this.removeHandlers.push(this.player.ui.addComponent({
            label: 'annoto-timeline',
            area: 'BottomBar',
            presets: ['Playback', 'Live'],
            get: () => <AnnotoTimelineComponent onReady={(el) => {
                this.adaptor.setControlsElement(el);
            }} />,
        }));
        
        /* this.removeHandlers.push(this.player.ui.addComponent({
            label: 'annoto-widget',
            area: 'SidePanelRight',
            presets: ['Playback', 'Live'],
            get: AnnotoPanelItemComponent,
        })); */
        /* this.sidePanelItemId = this.sidePanelsManager.addItem({
            label: 'annoto-widget',
            panelComponent: AnnotoPanelItemComponent,
            presets: ['Playback', 'Live'],
            position: 'right',
            expandMode: 'alongside',
            onActivate: () => { this.logger.debug('panel has now been activated') },
            onDeactivate: () => { this.logger.debug('panel has now been deactivated') },
        }); */
        /* this.player.configure({
            ui: {
                components: {
                    sidePanels: {
                        verticalSizes: {
                            min: 320
                        }
                    }
                }
            }
        }); */
    }
    
    get annotoApi(): Promise<IAnnotoApi> {
        return (async () => {
            await this.awaitBoot;
            return this.widgetApi!;
        })();
    }

    private async asyncReady(): Promise<void> {
        await this.awaitBootstrap;
        // this.showSidePanel();
    }

    /* private get sidePanelsManager(): IPlaykitSidePanelsManager {
        return this.player.getService('sidePanelsManager') as IPlaykitSidePanelsManager;
    }
    private showSidePanel(): void {
        // this.sidePanelsManager.activateItem(this.sidePanelItemId!);

        // https://github.com/kaltura/playkit-js-ui/blob/master/src/reducers/shell.js#L288
        this.player.ui.store.dispatch(ui.reducers.shell.actions.updateSidePanelMode('right', 'alongside'));
    }

    private hideSidePanel(): void {
        this.player.ui.store.dispatch(ui.reducers.shell.actions.updateSidePanelMode('right', 'hidden'));
    } */

    private async init(): Promise<void> {
        const { config } = this;
        try {
            const widgetUrl = config.bootstrapUrl || BUILD_ENV.widgetUrl;
            const dom = (KalturaPlayer.core.utils as any).Dom;
            const appEl = dom.createElement('div');
            dom.setAttribute(appEl, 'id', 'annoto-app');
            dom.appendChild(this.containerEl, appEl);
            if (this.adaptor.isInIframe()) {
                const htmlFrameElement = appEl.closest('html')
                htmlFrameElement.style.overflow = 'hidden';
            }
            await dom.loadScriptAsync(widgetUrl);
            this.bootstrapDone();
        } catch (err) {
            this.logger.error('widget bootstrap: ', err);
            this.bootstrapDone()
            return;
        }

        try {
            this.bootWidget();
        } catch (err) {
            this.logger.error('widget boot: ', err);
        }
    }

    private async bootWidget() {
        if (this.isWidgetBooted) {
            return;
        }
        Annoto.boot(this.widgetConfig);
        this.isWidgetBooted = true;

        Annoto.on('ready' as any, (api: IAnnotoApi) => {
            this.widgetApi = api;
            this.bootDone();
        });
    }

    private setupHookHandle = async ({ config }: { widgetIndex: number; config: IConfig; mediaSrc: string; }): Promise<IConfig> => {
        const { player } = this;

        if (player.isLive() && !player.isDvr()) {
            config.widgets[0].features!.timeline = { enabled: false };
        }

        if (this.onSetupHandler) {
            return (await this.onSetupHandler(config)) || config;
        }

        return config;
    }

    // for service usage

    onSetup(setupHandle: (config: IConfig) => Promise<IConfig>): void {
        this.onSetupHandler = setupHandle;
    }
}