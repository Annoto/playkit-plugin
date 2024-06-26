const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CommonConfig = require('./webpack.common');

module.exports = function (env) {
    const commonEnv = env;
    commonEnv.widgetURL = `https://widget-annoto.eu.ngrok.io/bootstrap.js`;
    return merge(CommonConfig(commonEnv), {
        devtool: 'inline-cheap-module-source-map',
        mode: 'development',
        devServer: {
            port: 9001,
            allowedHosts: 'all',
            client: {
                webSocketURL: {
                    protocol: 'wss',
                    hostname: `kaltura-plugin.eu.ngrok.io`,
                    port: 443,
                },
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'src/index.ejs',
                title: 'Annoto Kaltura Playkit Plugin',
                description: 'Annoto Kaltura Playkit Plugin',
                inject: false,
                scriptLoading: 'blocking',
                'meta': {
                    'viewport': 'width=device-width, initial-scale=1, shrink-to-fit=no',
                    'theme-color': '#EA5451',
                }
            }),
        ]
    });
};
