var bannerjs = require('bannerjs'),
    webpack = require('webpack');

module.exports = function(env) {
  
  var config = {
    context: __dirname,
    entry: './src/main.js',
    output: {
      filename: 'genscrape.js',
      path: __dirname + '/dist',
      library: 'genscrape',
      libraryTarget: 'umd'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['es2015']
          }
        }
      ]
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: bannerjs.onebanner(),
        raw: true
      })
    ]
  };
  
  // Minify for production build
  if(env && env.production){
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    config.output.filename = 'genscrape.min.js';
  }
  
  return config;
};