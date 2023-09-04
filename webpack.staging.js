const { merge } = require('webpack-merge');
const CommonConfig = require('./webpack.common');

module.exports = function (env) {
    const commonEnv = env;
    commonEnv.widgetURL = 'https://cdn.annoto.net/staging/widget/latest/bootstrap.js';
    return merge(CommonConfig(env), {
        devtool: 'nosources-source-map',
        mode: 'production',
        optimization: {
            splitChunks: {
                chunks: 'all',
                minSize: 100000,
            },
        },
    });
};
