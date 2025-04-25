const { override, disableEsLint, addWebpackAlias, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  // Desabilitar o ESLint no build
  disableEsLint(),
  
  // Adicionar todos os fallbacks necessários
  (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "http": require.resolve("stream-http"),
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url/"),
      "buffer": require.resolve("buffer/"),     
      "https": require.resolve('https-browserify'),
      "path": require.resolve("path-browserify"),
      "util": require.resolve("util/"),
      "assert": require.resolve("assert/"),
      "fs": false,
      "constants": require.resolve("constants-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "module": false,
    };
    return config;
  },
  
  // Adicionar os plugins necessários
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  )
);