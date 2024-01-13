var path = require('path')
var Dotenv = require('dotenv-webpack')

module.exports = {
  plugins: [
    // new webpack.NoEmitOnErrorsPlugin(),
    new Dotenv()
  ],
  stats: {
    // Nice colored output
    colors: true
  },
}
