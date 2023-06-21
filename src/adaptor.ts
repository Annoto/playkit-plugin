import {
    IMediaDetails,
    IPlayerAdaptorApi,
    PlayerEventCallback,
    CaptureUIEventCallback,
} from '@annoto/widget-api';
import {
    IPlaykitPlayer,
    PlaykitListenerType,
    Html5EventType,
    CustomEventType,
    IAnnotoPlaykitPlugin,
} from './interfaces';


// https://developer.kaltura.com/player/web/getting-started-web
// https://github.com/kaltura/kaltura-player-js


export class PlaykitPlayerAdaptor implements IPlayerAdaptorApi {
    private element?: HTMLElement;
    private controlsEl?: HTMLElement;
    private logger: KalturaPlayerTypes.Logger;
    private events: {
        event: string;
        fn: PlaykitListenerType;
    }[] = [];
    private captureUIDispose?: (() => void);

    constructor(
        private readonly player: IPlaykitPlayer,
        private readonly plugin: IAnnotoPlaykitPlugin,
    ) {
        this.logger = plugin.logger;
    }

    async init(element: HTMLElement) {
        this.reset();
        this.element = element;
        this.logger.debug('init adaptor');
        return true;
    }

    async remove() {
        this.reset();
        this.logger.debug('remove adaptor');
    }

    play() {
        return this.player.play();
    }

    pause() {
        return this.player.pause();
    }

    setCurrentTime(time: number) {
        this.player.currentTime = time;
    }

    isLive() {
        return this.player.isLive();
    }

    currentTime() {
        return this.player.currentTime;
    }

    duration() {
        return this.player.duration;
    }

    paused() {
        return this.player.paused;
    }

    mediaSrc() {
        const { player } = this;
        const config = player.config;
        const info = player.getMediaInfo();
        if ((!player.provider && !config?.session) || (!player.sources?.id && !info?.entryId)) {
            return '';
        }
        return `/partnerId/${player.provider.partnerId || config.session.partnerId}/entryId/${player.sources.id || info!.entryId}`;
    }

    async mediaMetadata(): Promise<IMediaDetails> {
        const player = this.player;

        await player.ready();
        
        const media = player.getMediaConfig();
        const meta = media!.sources.metadata;
        return {
            title: meta.name,
            description: meta.description,
            thumbnails: {
                default: player.poster,
            }
        };
    }

    autoplay(): boolean {
        return !!(this.player.config?.playback?.autoplay);
    }

    fullScreen(): boolean {
        return this.player.isFullscreen();
    }

    controlsHeight() {
        const height = (this.element?.querySelector('.playkit-bottom-bar') as HTMLElement)?.offsetHeight;
        return height;
    }

    controlsElement() {
        return this.controlsEl!;
    }

    setControlsElement(el: HTMLElement) {
        this.controlsEl = el;
    }

    width(): number {
        return this.player.dimensions.width;
    }

    height(): number {
        return this.player.dimensions.height;
    }

    onPlay(cb: PlayerEventCallback): void {
        this.on(Html5EventType.PLAY, cb);
    }

    onPause(cb: PlayerEventCallback): void {
        this.on(Html5EventType.PAUSE, cb)
    }

    onSeek(cb: PlayerEventCallback): void {
        this.on(Html5EventType.SEEKED, cb);
    }

    onTimeUpdate(cb: PlayerEventCallback): void {
        this.on(Html5EventType.TIME_UPDATE, cb);
    }

    onEnded(cb: PlayerEventCallback): void {
        this.on(Html5EventType.ENDED, cb);
    }

    onMediaChange(cb: PlayerEventCallback): void {
        this.on(CustomEventType.CHANGE_SOURCE_STARTED, cb);
        // this.on(CustomEventType.CHANGE_SOURCE_ENDED, cb);
    }

    onFullScreen(cb: (isFullScreen?: boolean) => void): void {
        this.on(CustomEventType.EXIT_FULLSCREEN, () => cb(false));
        this.on(CustomEventType.ENTER_FULLSCREEN, () => cb(true));
    }

    onSizeChange(cb: PlayerEventCallback): void {
        this.on(CustomEventType.RESIZE, cb);
    }

    onReady(cb: PlayerEventCallback) {
        cb();
    }

    onRemove(cb: PlayerEventCallback): void {
        this.on(CustomEventType.PLAYER_DESTROY, () => {
            this.reset();
            cb();
        });
    }

    onCaptureUIEvent(cb: CaptureUIEventCallback) {
        if (this.captureUIDispose) {
            this.captureUIDispose();
        }
        const { element } = this;
        const progressBarEl = element?.querySelector('.playkit-seek-bar') as HTMLElement;
        const mouseDownHandler = (ev: MouseEvent) => {
            const { clientX } = ev;
            const rect = progressBarEl.getBoundingClientRect();
            const timestamp = (clientX - rect.x) / rect.width * this.duration();
            cb({ ev, timestamp });
        };
        const keyDownHandler = (ev: KeyboardEvent) => {
            cb({ ev });
        };

        progressBarEl?.addEventListener('mousedown', mouseDownHandler , { capture: true });
        progressBarEl?.addEventListener('keydown', keyDownHandler, { capture: true });

        this.captureUIDispose = () => {
            progressBarEl.removeEventListener('mousedown', mouseDownHandler, { capture: true });
            progressBarEl.removeEventListener('keydown', keyDownHandler, { capture: true });
        };
    }

    private reset() {
        for (const ev of this.events) {
            this.player.removeEventListener(ev.event, ev.fn);
        }
        if (this.captureUIDispose) {
            this.captureUIDispose();
        }

        this.events = [];
        this.element = undefined;
    }

    private on(event: string, fn: PlaykitListenerType) {
        this.player.addEventListener(event, fn);
        this.events.push({
            event,
            fn,
        });
    }
}