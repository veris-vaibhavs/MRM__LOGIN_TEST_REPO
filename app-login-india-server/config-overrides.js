// const increaseSpecificity = require('postcss-increase-specificity')
const path = require('path');
module.exports = function override(config, env) {
    config.output = {
        ...config.output,
        library: 'login',
        libraryTarget: 'window',
    };
    config.optimization.splitChunks = {
        cacheGroups: {
            default: false,
        },
    };

    config.module.rules[2].oneOf[3].use[0] = path.resolve(__dirname, 'node_modules/style-loader');
    config.module.rules[2].oneOf[4].use[0] = path.resolve(__dirname, 'node_modules/style-loader');
    config.module.rules[2].oneOf[5].use[0] = path.resolve(__dirname, 'node_modules/style-loader');
    config.module.rules[2].oneOf[6].use[0] = path.resolve(__dirname, 'node_modules/style-loader');

    config.module.rules[2].oneOf[4].use[1].options['modules'] = { localIdentName: 'login-[local]-[hash:base64:5]' },
        config.module.rules[2].oneOf[6].use[1].options['modules'] = { localIdentName: 'login-[local]-[hash:base64:5]' },

        config.optimization.runtimeChunk = false;
    return config;
};
