
declare const process: {
    env: {
        version: string;
        ENV: 'dev' | 'prod';
        name: string;
        widgetUrl: string;
    };
};

export const BUILD_ENV = {
    ...process.env,
};