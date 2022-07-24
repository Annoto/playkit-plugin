/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* eslint func-names: ["error", "never"] */

const path = require('path');
const webpack = require('webpack');
const packageData = require('./package.json');

module.exports = function (env) {
    return {
        entry: './src/main.ts',
        target: 'web',
        output: {
            filename: 'plugin.js',
            path: path.resolve(__dirname, 'dist/'),
            sourceMapFilename: '[name].map',
            devtoolModuleFilenameTemplate: './annoto/[resource-path]',
            publicPath: '',
        },
        module: {
            rules: [
                /* {
                    test: /\.ts$/,
                    enforce: 'pre',
                    loader: 'tslint-loader',
                    options: {
                        emitErrors: true,
                    },
                }, */
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.json',
                    },
                    exclude: /node_modules/,
                },
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: 'style-loader',
                        },
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        [
                                            'autoprefixer',
                                            {
                                                // Options
                                            },
                                        ],
                                    ]
                                }
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sassOptions: {
                                    precision: 5,
                                    outputStyle: 'compressed',
                                }
                            },
                        },
                    ],
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        externals: {
            preact: 'root KalturaPlayer.ui.preact',
            'kaltura-player-js': ['KalturaPlayer'],
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    version: JSON.stringify(packageData.version),
                    ENV: JSON.stringify(env.envName),
                    name: JSON.stringify(packageData.name),
                    widgetUrl: JSON.stringify(env.widgetURL),
                },
            }),
        ],
    };
};
