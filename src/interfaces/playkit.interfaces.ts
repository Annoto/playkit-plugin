import { ComponentClass, FunctionalComponent } from 'preact';
import { KalturaPlayer as IKalturaPlayer, PlaykitUI, UIManager } from 'kaltura-player-js';

export interface IKalturaPlayerGlobal extends IKalturaPlayer {
    getPlayer(id: string): IPlaykitPlayer;
    getPlayers(): { [key: string]: IPlaykitPlayer };
}

export interface IPlaykitPlayer
    extends IFakeEventTarget,
        Omit<KalturaPlayerTypes.Player, 'addEventListener' | 'removeEventListener' | 'dispatchEvent'> {
    /**
     * The player readiness
     * @returns The ready promise
     */
    ready(): Promise<void>;

    /**
     * Configures the player according to a given configuration.
     * Does Deep merge with exsiting config
     */
    configure(options: Partial<IPlaykitConfig>): void;

    /**
     * Start/resume playback.
     */
    play(): void;

    /**
     * Pause playback.
     */
    pause(): void;

    /**
     * Gets the view of the player (i.e the dom container object).
     * @return  The dom container.
     */
    getView(): HTMLElement;

    /**
     * @returns The video element.
     */
    getVideoElement(): HTMLVideoElement;

    /**
     * Get/Set the current time in seconds.
     */
    currentTime: number;

    /**
     * Get the duration in seconds.
     */
    readonly duration: number;
    /**
     * Get paused state
     */
    readonly paused: boolean;

    /**
     * Get seeking state
     */
    readonly seeking: boolean;

    /**
     * Checking if the current playback is live.
     */
    isLive(): boolean;

    /**
     * Get whether the video is seeked to live edge in dvr
     * @returns Whether the video is seeked to live edge in dvr
     */
    isOnLiveEdge(): boolean;

    /**
     * Checking if the current live playback has DVR window.
     * @returns Whether live playback has DVR window.
     */
    isDvr(): boolean;

    /**
     * Seeking to live edge.
     */
    seekToLiveEdge(): void;

    /**
     * Get the start time of DVR window in live playback in seconds.
     * @returns start time of DVR window.
     */
    getStartTimeOfDvrWindow(): number;

    /**
     * Get whether the media has been ended.
     */
    readonly ended: boolean;

    /**
     * Get the current player source.
     */
    readonly src?: string;

    /**
     * Get the dimensions of the player.
     */
    readonly dimensions: { width: number; height: number };

    /**
     * @returns Whether the player is in fullscreen mode.
     */
    isFullscreen(): boolean;

    /**
     * Check if the player is in picture in picture mode
     * @return if the player is in picture in picture mode or not
     */
    isInPictureInPicture(): boolean;

    /**
     * Checking if the selected source is VR.
     * @returns Whether is VR.
     */
    isVr(): boolean;

    /**
     * Get the poster source URL
     */
    readonly poster: string;

    /**
     * Gets/Sets the playback speed of the video.
     */
    playbackRate: number;

    /**
     * Gets the possible playback speeds of the video.
     */
    readonly playbackRates: Array<number>;

    /**
     * Gets the default playback speed of the video.
     */
    readonly defaultPlaybackRate: number;

    /**
     * get the engine type (html5)
     */
    readonly engineType: string;

    /**
     * get the stream type
     */
    readonly streamType?: 'hls' | ' dash' | ' progressive';

    /**
     * Get the player config object.
     */
    readonly config: IPlaykitConfig;

    loadMedia(mediaInfo: IProviderMediaInfoObject, mediaOptions?: KalturaPlayerTypes.Sources): Promise<void>;
    getMediaInfo(): IProviderMediaInfoObject | undefined;
    getMediaConfig(): IProviderMediaConfigObject | undefined;
    /**
     * @param track The track to select from getTracks()
     */
    selectTrack(track: unknown): void;

    readonly uiComponents: IPlaykitUiComponent[];
    /**
     * Dynamically manage components
     * https://github.com/kaltura/playkit-js-ui/blob/master/docs/ui-components.md#injecting-and-removing-a-ui-component-dynamically
     */
    readonly ui: IPlaykitUiManager;

    /**
     * Gets the plugins instances.
     * @returns Plugin name to plugin instance object map.
     */
    readonly plugins: { [name: string]: IPlaykitBasePlugin };

    /**
     * Get/Set playsinline attribute.
     * Relevant for iOS 10 and up:
     * Elements will now be allowed to play inline, and will not automatically enter fullscreen mode when playback begins.
     */
    playsinline: boolean;

    /**
     * Get/Set playback volume.
     */
    volume: number;

    /**
     * Get/Set player muted state.
     */
    muted: boolean;

    /**
     * Resets the necessary components before change media.
     */
    reset(): void;

    /**
     * Destroys the player.
     */
    destroy(): void;

    /**
     * Get the first buffered range of the engine.
     * @returns First buffered range of the engine in seconds.
     */
    readonly buffered?: TimeRanges;

    readonly stats: { targetBuffer: number; availableBuffer: number };

    readonly _pluginManager: IPlaykitPluginManager;
    readonly _pluginsConfig: { [name: string]: unknown };
}

interface IFakeEventTarget {
    /**
     * Add an event listener to this object.
     *
     * @param type The event type to listen for.
     * @param listener The callback or listener object to invoke.
     */
    addEventListener(type: string, listener: PlaykitListenerType): void;

    /**
     * Remove an event listener from this object.
     *
     * @param type The event type for which you wish to remove a listener.
     * @param listener The callback or listener object to remove
     */
    removeEventListener(type: string, listener: PlaykitListenerType): void;

    /**
     * Dispatch an event from this object.
     *
     * @param event The event to be dispatched from this object.
     * @return True if the default action was prevented.
     */
    dispatchEvent(event: IFakeEvent): boolean;
}

export interface IPlaykitConfig extends KalturaPlayerTypes.PlayerConfig {
    session: IPlaykitSession;
    ui: IPlaykitUiConfig;
}

export interface IPlaykitSession extends KalturaPlayerTypes.Session {
    userId?: string;
    userRole?: string;
}

export type PlaykitListenerType = (event: IFakeEvent) => void | boolean;

export interface IFakeEvent {
    readonly bubbles: boolean;
    readonly cancelable: boolean;
    readonly defaultPrevented: boolean;
    /**
     * According to MDN, Chrome uses high-res timers instead of epoch time.
     * Follow suit so that timeStamps on FakeEvents use the same base as
     * on native Events.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Event/timeStamp
     */
    readonly timeStamp: number | Date;
    readonly type: string;
    readonly isTrusted: boolean;
    readonly currentTarget: EventTarget;
    readonly target: EventTarget;
    /**
     * Non-standard property read by FakeEventTarget to stop processing listeners.
     * user stopImmediatePropagation() to stop.
     */
    readonly stopped: boolean;
    readonly payload: any;

    /**
     * Does nothing, since FakeEvents have no default.  Provided for compatibility
     * with native Events.
     */
    preventDefault(): void;

    /**
     * Stops processing event listeners for this event.  Provided for compatibility
     * with native Events.
     */
    stopImmediatePropagation(): void;

    /**
     * Does nothing, since FakeEvents do not bubble.  Provided for compatibility
     * with native Events.
     */
    stopPropagation(): void;
}

export interface IOVPProviderMediaInfoObject extends KalturaPlayerTypes.MediaInfo {
    entryId?: string;
    ks?: string;
}

export interface IOTTProviderMediaInfoObject extends IOVPProviderMediaInfoObject {
    mediaType?: string;
    contextType?: string;
    protocol?: string;
    fileIds?: string;
    assetReferenceType?: string;
    formats?: Array<string>;
}

export type IProviderMediaInfoObject = IOVPProviderMediaInfoObject | IOTTProviderMediaInfoObject;

export interface IProviderMediaConfigObject {
    session: IProviderMediaConfigSessionObject;
    sources: IProviderMediaConfigSourcesObject;
    plugins: { [plugin: string]: Object };
}

export interface IProviderMediaConfigSessionObject {
    partnerId: number;
    uiConfId?: number;
    ks?: string;
}

export interface IProviderMediaConfigSourcesObject {
    dash: Array<IProviderMediaSourceObject>;
    hls: Array<IProviderMediaSourceObject>;
    progressive: Array<IProviderMediaSourceObject>;
    duration: number;
    type: string;
    id: string;
    poster: string | Array<Object>;
    dvr: boolean;
    vr?: any;
    metadata: IProviderMediaConfigMetadataObject;
    captions?: Array<IPKExternalCaptionObject>;
}

export interface IProviderMediaSourceObject {
    id: string;
    url: string;
    mimetype: string;
    bandwidth?: number;
    width?: number;
    height?: number;
    label?: string;
    drmData?: Array<IProviderDrmDataObject>;
}

export interface IProviderMediaConfigMetadataObject {
    name: string;
    description: string;
}

type IPKExternalCaptionObject = any;
type IProviderDrmDataObject = any;

export enum PluginPositions {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}

export enum PluginStates {
    OPENED = 'opened',
    CLOSED = 'closed',
}

export interface IPlaykitBasePlugin extends KalturaPlayerTypes.BasePlugin {
    readonly player: IPlaykitPlayer;

    /**
     * Signal player that plugin has finished loading its dependencies and player can continue to loading and playing states.
     * Use this when your plugin requires to load 3rd party dependencies which are required for the plugin operation.
     * By default the base plugin returns a resolved plugin.
     * If you wish the player load and play (and middlewares interception) to wait for some async action (i.e loading a 3rd party library),
     * you can override and return a Promise which is resolved when the plugin completes all async requirements.
     */
    readonly ready: Promise<void>;
    /**
     * The player will call this method before destroying itself.
     */
    destroy(): void;
    /**
     * The player will call this method before changing media.
     */
    reset(): void;

    getUIComponents?(): IPlaykitUiComponent[];
}

// ******** UI Manager ********** //

export interface IPlaykitUiManager extends UIManager {
    addComponent(comp: IPlaykitUiComponent): PlaykitRemoveComponentHandlerType;
}

export type PlaykitRemoveComponentHandlerType = () => void;

export interface IPlaykitUiComponent {
    label: string;
    presets: PlaykitUI.ReservedPresetName[];
    area: PlaykitReservedPresetAreaType;
    get: Function;
    props?: { [key: string]: any };
    beforeComponent?: string;
    afterComponent?: string;
    replaceComponent?: string;
    container?: string;
}

export type PlaykitReservedPresetAreaType =
    | 'PresetFloating'
    | 'BottomBarLeftControls'
    | 'BottomBarRightControls'
    | 'TopBarLeftControls'
    | 'TopBarRightControls'
    | 'SidePanelTop'
    | 'SidePanelLeft'
    | 'SidePanelRight'
    | 'SidePanelBottom'
    | 'PresetArea'
    | 'InteractiveArea'
    | 'PlayerArea'
    | 'VideoArea'
    | 'BottomBar'
    | 'SeekBar';

/**
 * https://github.com/kaltura/playkit-js-ui/tree/master/flow-typed/types
 */
export interface IPlaykitUiConfig extends KalturaPlayerTypes.UI {
    targetId?: string;
    debugActions?: boolean;
    forceTouchUI?: boolean;
    showCCButton?: boolean;
    hoverTimeout?: number;
    uiComponents?: IPlaykitUiComponent[];
    translations?: { [langKey: string]: Object };
    locale?: string;
    components?: {
        seekbar?: unknown;
        watermark?: unknown;
        vrStereo?: unknown;
        logo?: unknown;
        fullscreen?: {
            disableDoubleClick?: boolean;
        };
        sidePanels?: {
            verticalSizes?: IPlaykitSidePanelsSize;
            horizontalSizes?: IPlaykitSidePanelsSize;
        };
    };
}

export interface IPlaykitSidePanelsSize {
    max?: number;
    min?: number;
    ratio?: number;
}

// ****** Side Panel Manager ******** //

/**
 * https://github.com/kaltura/playkit-js-ui-managers
 */
export interface IPlaykitSidePanelsManager {
    // https://github.com/kaltura/playkit-js-ui-managers/blob/master/src/services/side-panels-manager/side-panels-manager.ts#L15
    readonly activePanels?: {
        bottom: null | unknown;
        left: null | unknown;
        right: null | unknown;
        top: null | unknown;
    };
    addItem(item: IPlaykitSidePanelItem): number;
    removeItem(itemId: number): void;
    activateItem(itemId: number): void;
    deactivateItem(itemId: number): void;
    isItemActive(itemId: number): boolean;
}

export interface IPlaykitSidePanelItem {
    readonly label: string;
    readonly iconComponent?: ComponentClass<IPlaykitIconComponentProps> | FunctionalComponent<IPlaykitIconComponentProps>;
    readonly panelComponent: ComponentClass<IPlaykitPanelComponentProps> | FunctionalComponent<IPlaykitPanelComponentProps>;
    readonly presets: PlaykitUI.ReservedPresetName[];
    readonly position: PlaykitUI.SidePanelPosition;
    readonly expandMode: PlaykitUI.SidePanelMode;
    readonly onActivate?: () => void;
    readonly onDeactivate?: () => void;
}

export interface IPlaykitPanelComponentProps {
    isActive: boolean;
}

export interface IPlaykitIconComponentProps extends IPlaykitPanelComponentProps {}

export interface IPlaykitState {
    shell: IPlaykitShellState;
}

export interface IPlaykitShellState {
    sidePanelsModes: {
        bottom: PlaykitSidePanelMode;
        left: PlaykitSidePanelMode;
        right: PlaykitSidePanelMode;
        top: PlaykitSidePanelMode;
    };
}

export type PlaykitSidePanelMode = PlaykitUI.SidePanelMode;

// ****** Kaltura Player Types ******** //

export interface IPlaykitPluginManager {
    get(name: string): IPlaykitBasePlugin | undefined;
    getAll(): { [name: string]: IPlaykitBasePlugin };
    load(name: string, player: IPlaykitPlayer, config: unknown): void;
    getRegisterdPluginsList(): string[];
    loadMedia(): void;
    destroy(): void;
    reset(): void;
}
