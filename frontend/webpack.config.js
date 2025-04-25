const path = require('path');

module.exports = {
  mode: "development",
  resolve: {
    fallback: {
      "https": require.resolve("https-browserify"),
      "http": require.resolve("stream-http"),
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url/"),
      "buffer": require.resolve("buffer/"),      
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

