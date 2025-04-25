/* eslint-disable no-dupe-keys */
const path = require('path');

module.exports = {
  mode: "development",
  resolve: {
    extensions: ['.js', '.jsx'], // Inclua outras extensões, se necessário

    fallback: {
     
      "http": require.resolve("stream-http"),
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url/"),
      "buffer": require.resolve("buffer/"),     
      https: require.resolve('https-browserify'),
 
    },
  },

  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
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
      },
  
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), // Caminho para os arquivos estáticos
    },
    compress: true,
    port: 3000,
  },
};

