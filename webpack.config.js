var bannerjs = require('bannerjs'),
    webpack = require('webpack'),
    argv = require('minimist')(process.argv);

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'genscrape.js',
    path: __dirname + '/dist',
    library: 'genscrape',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.BannerPlugin(bannerjs.onebanner(), {raw: true})
  ]
};

// Add minification, enabled by a cli flag
if(argv.min){
  module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin());
  module.exports.output.filename = 'genscrape.min.js';
}