/* eslint-disable no-dupe-keys */
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: "development",
  resolve: {
    extensions: ['.js', '.jsx'], // Inclua outras extensões, se necessário

    fallback: {
      // Seus fallbacks existentes
      "http": require.resolve("stream-http"),
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url/"),
      "buffer": require.resolve("buffer/"),     
      "https": require.resolve('https-browserify'),
      
      // Novos fallbacks necessários com base nos erros
      "path": require.resolve("path-browserify"),
      "util": require.resolve("util/"),
      "assert": require.resolve("assert/"),
      "fs": false, // Definido como false porque não tem solução simples no navegador
      "constants": require.resolve("constants-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "module": false, // Definimos como false para o erro de createRequire
    },
  },

  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Aceita arquivos JS e JSX
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  plugins: [
    // Adicione o plugin ProvidePlugin para fornecer polyfills automaticamente
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Caminho para os arquivos estáticos
    },
    compress: true,
    port: 3000,
    historyApiFallback: true, // Para SPA funcionarem com rotas
  },
};