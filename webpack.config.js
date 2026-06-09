const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
    ...defaultConfig,
    entry: {
        'admin/index': path.resolve(process.cwd(), 'assets/src/admin/index.js'),
        'public/accessibility-widget': path.resolve(process.cwd(), 'assets/src/public/accessibility-widget.js'),
    },
    output: {
        ...defaultConfig.output,
        path: path.resolve(process.cwd(), 'build'),
        filename: '[name].js',
    },
};
