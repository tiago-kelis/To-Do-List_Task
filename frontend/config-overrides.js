const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "https": require.resolve("https-browserify"),
    "http": require.resolve("stream-http"),
    "stream": require.resolve("stream-browserify"),
    "url": require.resolve("url/"),
    "buffer": require.resolve("buffer/"),
    "path": require.resolve("path-browserify"),
    "util": require.resolve("util/"),
    "assert": require.resolve("assert/"),
    "fs": false,
    "constants": require.resolve("constants-browserify"),
    "os": require.resolve("os-browserify/browser"),
    "module": false,
  };

  // Adiciona o alias para o shim personalizado
  config.resolve.alias = {
    ...config.resolve.alias,
    'process/browser': path.resolve(__dirname, 'src/shims/process-browser.js'),
  };

  // Adiciona o ProvidePlugin
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: path.resolve(__dirname, 'src/shims/process-browser.js'),
      Buffer: ['buffer', 'Buffer'],
    }),
  ];
  
  return config;
};