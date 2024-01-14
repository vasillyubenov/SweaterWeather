var path = require('path')
var Dotenv = require('dotenv-webpack')

module.exports = {
  entry: './src/js/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new Dotenv()
  ],
  stats: {
    // Nice colored output
    colors: true
  },
}
