const webpack = require('webpack');

module.exports = {
    entry: './src/main.js',
    output: {
        path: __dirname + '/bin',
        filename: 'app.bundle.js'
    },
    module: {
         loaders: [{
             test: /\.js$/,
             exclude: /node_modules/,
             loader: 'babel-loader',
             query: {
                presets: ['es2015']
            }
         }]
     },
     plugins: process.env.PROD? [
         new webpack.optimize.UglifyJsPlugin({
           minimize: true
         })
       ]: []
};