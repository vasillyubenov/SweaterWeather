var path = require('path')
var Dotenv = require('dotenv-webpack')

module.exports = {
  entry: ['./src/js/index.js', './src/js/register.js'],
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new Dotenv()
  ],
  stats: {
    colors: true
  },
}