const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    rangeslider: './src/index.style.js',
    'rangeslider.nostyle': './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].umd.min.js',
    library: 'rangeSlider',
    libraryTarget: 'umd',
    globalObject: 'this'
  }
}
