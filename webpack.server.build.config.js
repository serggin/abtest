const path = require('path');
var nodeExternals = require('webpack-node-externals');

const buildDirectory = 'dist';
const outputDirectory = `${buildDirectory}/server`;

module.exports = {
  mode: 'production',
  entry: [
    './src/server/index.js'
  ],
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: 'bundle.js',
    publicPath: '/server'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          plugins: []
        }
      },
    }],
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  target: 'node',
  externals: [nodeExternals()],
  plugins: [],

}
