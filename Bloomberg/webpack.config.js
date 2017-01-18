var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './scripts/main.js',
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    devServer: {
        port: 1738,
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                test: path.join(__dirname, 'scripts'),
                query: {
                    presets: 'es2015',
                },
            }
        ]
    },
    plugins: [
        new webpack.NoErrorsPlugin()
    ],
    stats: {
        colors: true
    },
    devtool: 'source-map',
};
