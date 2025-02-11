import {
    IConfig,
    IAnnotoApi,
    Annoto as AnnotoMain,
    IWidgetConfig,
} from '@annoto/widget-api';
import {
    CustomEventType,
    IAnnotoPlaykitPlugin,
    IAnnotoPlaykitPluginConfig,
    IPlaykitPlayer,
    IPlaykitSidePanelsManager,
    IPlaykitState,
    PlaykitRemoveComponentHandlerType,
} from './interfaces';
import { BUILD_ENV } from './constants';
import { AnnotoTimelineComponent } from './components';
import { PlaykitPlayerAdaptor } from './adaptor';
import { PlaykitAnnotoService } from './annoto.service';
import { throttle } from './util';

import './style.scss';

const h = (KalturaPlayer.ui as any).h;

declare const Annoto: AnnotoMain;

export class PlaykitAnnotoPlugin extends (KalturaPlayer as any).BasePlugin implements IAnnotoPlaykitPlugin {
    static AUTO_BOOT = false;
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

    constructor(name: string, player: IPlaykitPlayer, { bootstrapUrl, manualBoot, ...config}: IAnnotoPlaykitPluginConfig) {
        super(name, player, { bootstrapUrl, manualBoot, ...config });
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
        
        this.widgetConfig = this.mergeConfigUpdate(config);

        this.player.registerService('annoto', this.service);

        this.init().then(() => {
            if (manualBoot === false || (PlaykitAnnotoPlugin.AUTO_BOOT === true && manualBoot !== true)) {
                return this.boot();
            } else {
                this.logger.info('skip automatic boot');
            } 
        }).catch((err) => {});
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

    async boot(configUpdate?: Partial<IConfig>): Promise<IAnnotoApi> {
        if (this.isWidgetBooted) {
            this.logger.warn('already booted');
            return this.annotoApi;
        }
        this.logger.info('boot');
        try {
            await this.awaitBootstrap;
            
            this.widgetConfig = this.mergeConfigUpdate(configUpdate);
            this.bootWidget();
            await this.awaitBoot;
            return this.widgetApi!;
        } catch (err) {
            this.logger.error('widget boot: ', err);
            throw err;
        }
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

    private get sidePanelsManager(): IPlaykitSidePanelsManager {
        return this.player.getService('sidePanelsManager') as IPlaykitSidePanelsManager;
    }

    /*
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
            this.logger.info('init');
            const widgetUrl = config.bootstrapUrl || BUILD_ENV.widgetUrl;
            const dom = (KalturaPlayer.core.utils as any).Dom;
            const appEl = dom.createElement('div');
            dom.setAttribute(appEl, 'id', 'annoto-app');
            dom.appendChild(this.containerEl, appEl);

            await dom.loadScriptAsync(widgetUrl);
            this.bootstrapDone();
        } catch (err) {
            this.logger.error('widget bootstrap: ', err);
            this.bootstrapDone()
            return;
        }
    }

    private mergeConfigUpdate(update?: Partial<IConfig>): IConfig {
        const baseConfig: Partial<IConfig> = KalturaPlayer.core.utils.Object.mergeDeep({}, this.widgetConfig || {});
        const baseWConfig: Partial<IWidgetConfig> = { ...baseConfig.widgets?.[0] };
        const updateConfig: Partial<IConfig> = { ...update };
        const updateWConfig: Partial<IWidgetConfig> = { ...updateConfig.widgets?.[0] };
        // update all, keep setup hook, widget timeline overlay and player. make sure widget features is not undefined
        // KalturaPlayer.core.utils.Object.mergeDeep() does not merge arrays, so we make sure to merge widgets manually
        return KalturaPlayer.core.utils.Object.mergeDeep(baseConfig, {
            ...updateConfig,
            hooks: {
                ...updateConfig.hooks,
                setup: this.setupHookHandle,
            },
            widgets: [
                KalturaPlayer.core.utils.Object.mergeDeep(baseWConfig, {
                    ...updateWConfig,
                    features: { ...updateWConfig.features },
                    timeline: {
                        ...updateWConfig.timeline,
                        overlay: true,
                    },
                    player: {
                        ...updateWConfig.player,
                        type: 'custom',
                        element: this.containerEl,
                        adaptorApi: this.adaptor,
                    },
                }),
            ],
        });
    }

    private async bootWidget() {
        if (this.isWidgetBooted) {
            return;
        }
        Annoto.boot(this.widgetConfig);
        this.isWidgetBooted = true;
        const bodyElement = document.querySelector('body');
        let inIframe = false;
        try {
            inIframe = self !== window.parent
        } catch (e) { }
        if (bodyElement!.classList.contains('module-browseandembed') && inIframe) {
            this.player.addEventListener(CustomEventType.RESIZE, () => {
                setTimeout(this.iframeEmbedFixOnsizeChangeHandle);
            });
        }

        Annoto.on('ready' as any, (api: IAnnotoApi) => {
            this.widgetApi = api;
            this.bootDone();
        });

        /* Annoto.on('ux', (ev: IUxEvent) => {
            if (ev.name === 'widget:show' || ev.name === 'widget:hide' || ev.name === 'widget:minimise') {
                this.handleWidgetTransition();
            }
        }); */
        this.player.addEventListener(CustomEventType.RESIZE, this.updateSidePanelClasses);
        // this.player.ui.store.subscribe(this.updateSidePanelClasses);
    }

    private updateSidePanelClasses = throttle(() => {
        const { left, right } = this.sidePanelsManager?.activePanels || {};
        const { shell } = this.player.ui.store.getState() as IPlaykitState || {};
        const { sidePanelsModes } = shell || {};
        this.containerEl.classList.toggle('nn-player-side-panel-left', !!left && sidePanelsModes?.left === 'alongside');
        this.containerEl.classList.toggle('nn-player-side-panel-right', !!right && sidePanelsModes?.right === 'alongside');
    }, 200, { debounceLast: true });

    /* private handleWidgetTransition() {
        const playerContainer = this.getPlayerContainer();
        if (!playerContainer) {
            return;
        }
        this.dispatchUIStateChange(playerContainer);
        const timeline: number[] = [30, 60, 80, 100, 120, 150, 170, 200, 250, 300, 400];
        timeline.forEach((time) => setTimeout(this.dispatchUIStateChange, time, playerContainer));
    }

    private dispatchUIStateChange = (playerContainer: HTMLElement): void => {
        // https://github.com/kaltura/playkit-js-ui/blob/master/src/reducers/shell.ts#L276
        // https://github.com/kaltura/playkit-js-ui/blob/master/src/components/shell/shell.tsx#L212
        // https://github.com/kaltura/playkit-js-ui/blob/master/src/components/player-area/styles-store-adapter.tsx#L83
        const rect = playerContainer.getBoundingClientRect();
        const { store } = this.player.ui;
        const { actions } = KalturaPlayer.ui.reducers.shell;
        store.dispatch(actions.updateDocumentWidth(document.body.clientWidth));
        store.dispatch(actions.updatePlayerClientRect(rect));
    };

    private getPlayerContainer(): HTMLElement | null {
        return this.player.getView().closest('.kaltura-player-container');
    } */

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

    private iframeEmbedFixOnsizeChangeHandle = () => {
        const htmlEl = document.querySelector('html');
        if (this.canHeightCauseScrollbar()) {
            htmlEl!.classList.add('annoto-playkit-plugin-iframe-embed-fix');
        } else {
            htmlEl!.classList.remove('annoto-playkit-plugin-iframe-embed-fix');
        }
    }

    private canHeightCauseScrollbar(): boolean {
        const h = this.player.dimensions.height;
        if (!h) {
            return false;
        }
        const innerHeight = window.innerHeight;
        return !!(h >= (innerHeight - 50));
    }

    // for service usage

    onSetup(setupHandle: (config: IConfig) => Promise<IConfig>): void {
        this.onSetupHandler = setupHandle;
    }
}