import { ThemeType } from '@annoto/widget-api';

export interface IGlobal {
    NN_PLAYKIT_AUTO_BOOT?: boolean;
    NN_PLAYKIT_API_KEY?: string;
    NN_PLAYKIT_REGION?: 'eu' | 'us' | 'staging';
    NN_PLAYKIT_THEME?: ThemeType;
}
