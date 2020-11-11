const { resolve } = require('path')
const { merge } = require('webpack-merge')
const glob = require('glob')
const common = require('./webpack.common.js')
const { PROJECT_PATH } = require('../constant')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const PurgecssWebpackPlugin = require('purgecss-webpack-plugin')
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  plugins: [
    new CleanWebpackPlugin(),
    // new BundleAnalyzerPlugin(),
    // 生产环境去掉没有使用的css
    new PurgecssWebpackPlugin({
      paths: glob.sync(`${resolve(PROJECT_PATH, './src')}/**/*.{tsx,less,scss,css}`, { nodir: true }),
    }),
  ],
})
