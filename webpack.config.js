var path = require('path')
var Dotenv = require('dotenv-webpack')
const express = require('express')

module.exports = {
  entry: ['./src/js/index.js', './src/js/register.js', `./src/js/detail.js`,  './src/js/error.js'],
  entry: {
    index: './src/js/index.js',
    detail: './src/js/detail.js',
    register: './src/js/register.js',
    error: './src/js/error.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: path.resolve(__dirname, 'public'),
  },
  plugins: [
    new Dotenv()
  ],
  stats: {
    colors: true
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    setup(app){
      app.use(express.static('public'));

      app.get('/error', function(req, res) {
        res.sendFile(path.join(__dirname + '/src/error.html'));
      });

      app.get('/app', function(req, res) {
        res.sendFile(path.join(__dirname + '/index.html'));
      });

      app.get('/detail', function(req, res) {
        res.sendFile(path.join(__dirname + '/detail.html'));
      });


      app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/src/register.html'));
      });
    }
  },
}