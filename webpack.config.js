const path = require('path');

module.exports = {
    entry: {
        app: './script/component.js'
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'pink-trombone.min.js'
    },
    module: {
        rules: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['@babel/env']
            }
        }]
    }
}