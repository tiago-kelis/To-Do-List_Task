const webpack = require('webpack');

module.exports = {
 
  webpack: {
    configure: {
      resolve: {
        fallback: {
          https: require.resolve('https-browserify'),
          http: require.resolve('stream-http'),
          stream: require.resolve('stream-browserify'),
          url: require.resolve('url/'),
          buffer: require.resolve('buffer/'),
          path: require.resolve('path-browserify'),
          util: require.resolve('util/'),
          assert: require.resolve('assert/'),
          fs: false,
          constants: require.resolve('constants-browserify'),
          os: require.resolve('os-browserify/browser'),
          module: false,
        },
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  },
};