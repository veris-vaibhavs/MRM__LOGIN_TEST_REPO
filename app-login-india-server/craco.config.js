// DUMP and check the WEBPACK config
const { WebpackConfigDumpPlugin } = require('webpack-config-dump-plugin');

// remove Locale package rom moment js
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

// https://stackoverflow.com/a/41041580/362574
// remove console prints
const TerserPlugin = require('terser-webpack-plugin');

//new IgnorePlugin(/^\.\/locale$/, /moment$/),
const webpack = require('webpack');
const path = require('path');

const tailwindcss_plugin = require('tailwindcss');
const autoprefixer_plugin = require('autoprefixer');

const ORG_NAME = 'veris';
const APP_NAME = 'login';
//const {whenProd} = require("@craco/craco");

module.exports = {
    style: {
        modules: {
            localIdentName: `${APP_NAME}-[local]-[hash:base64:5]`,
        },
        postcss: {
            plugins: [tailwindcss_plugin, autoprefixer_plugin],
        },
    },
    babel: {
        presets: [],
        plugins: [
            '@babel/plugin-syntax-dynamic-import',
            '@babel/plugin-transform-react-jsx',
            '@babel/plugin-proposal-class-properties',
            [
                'import',
                {
                    libraryName: 'antd',
                    libraryDirectory: 'es',
                    style: 'css',
                },
                'antd',
            ],
            [
                'import',
                {
                    libraryName: 'lodash',
                    libraryDirectory: '',
                    camel2DashComponentName: false, // default: true
                },
                'lodash',
            ],
            [
                'import',
                {
                    libraryName: '@material-ui/core',
                    // Use "'libraryDirectory': ''," if your bundler does not support ES modules
                    libraryDirectory: 'esm',
                    camel2DashComponentName: false,
                },
                'material-core',
            ],
            [
                'import',
                {
                    libraryName: '@material-ui/icons',
                    // Use "'libraryDirectory': ''," if your bundler does not support ES modules
                    libraryDirectory: 'esm',
                    camel2DashComponentName: false,
                },
                'material-icons',
            ],
        ],
    },
    webpack: {
        plugins: [
            new MomentLocalesPlugin(),
            // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), this is by default enabled with `craco webpack config`
            // new LodashModuleReplacementPlugin(),
            new WebpackConfigDumpPlugin({
                depth: 8,
            }),
        ],
        configure: {
            entry: {
                main: './src/index.js', // main is simply the [ name ] part of the file
            },
            output: {
                library: `${APP_NAME}`,
                libraryTarget: 'window',
                // publicPath: `/apps/${APP_NAME}/`,
                filename: `static/js/[name].[hash].${APP_NAME}.js`, // this always gives you a constant file name
                // without any hash `[name].[hash].${APP_NAME}.js` // gives you hashed version of the file
                path: path.resolve(__dirname, 'build'),
            },
            optimization: {
                usedExports: true,
                splitChunks: {
                    chunks: 'all',
                    name: false,
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        // if we provide any vendors configuration
                        // it would break src (main js) and node modules (chink js)
                        // this breaks the spa application (what we have right now)
                    },
                },
                runtimeChunk: false,
            },
        },
    },
    plugins: [
        // Webpack config override
        {
            plugin: {
                overrideWebpackConfig: ({
                                            webpackConfig,
                                            cracoConfig,
                                            pluginOptions,
                                            context: { env, paths },
                                        }) => {
                    //////#### Based on SPA config
                    // ########################################################################
                    if (
                        env === 'production' ||
                        webpackConfig.mode === 'production'
                    ) {
                        webpackConfig.plugins = webpackConfig.plugins.filter(
                            (plugin) =>
                                plugin.constructor.name !==
                                'HtmlWebpackPlugin' &&
                                plugin.constructor.name !==
                                'MiniCssExtractPlugin',
                        );
                    }
                    // remove console prints from production
                    if (
                        env === 'production' ||
                        webpackConfig.mode === 'production'
                    ) {
                        webpackConfig.optimization.minimize = true;
                        webpackConfig.optimization.minimizer = [
                            new TerserPlugin({
                                sourceMap: true, // Must be set to true if using source-maps in production
                                terserOptions: {
                                    compress: {
                                        drop_console: true,
                                    },
                                },
                            }),
                        ];
                    }
                    // ########################################################################
                    // this helps inline the CSS <link> within JS
                    // the single-spa module loads <script> and not <links>
                    // so the css files won't get loaded unless they are emedded into JS
                    //////####
                    const rules = webpackConfig.module.rules;
                    let i = 0;
                    for (i; i < rules.length; i++) {
                        if (rules[i].oneOf !== undefined) break;
                    }
                    let oneOfs = webpackConfig.module.rules[i].oneOf;
                    for (let z = 0; z < oneOfs.length; z++) {
                        let item = oneOfs[z];
                        if (item.test !== undefined) {
                            if (
                                String(item.test) === String(/\.css$/) ||
                                String(item.test) ===
                                String(/\.module\.css$/) ||
                                String(item.test) ===
                                String(/\.(scss|sass)$/) ||
                                String(item.test) ===
                                String(/\.module\.(scss|sass)$/)
                            ) {
                                item.use[0] = path.resolve(
                                    __dirname,
                                    'node_modules/style-loader',
                                );
                            }
                        }
                        webpackConfig.module.rules[i].oneOf[z] = item;
                    }
                    return webpackConfig;
                },
            },
        },
    ],
};
