const { merge } = require('webpack-merge')
const { SERVER_HOST, SERVER_PORT } = require('../constant.js')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    host: SERVER_HOST,
    port: SERVER_PORT,
    stats: 'errors-only', // 终端仅打印error
    clientLogLevel: 'silent', // 日志等级
    compress: true, // 是否启用 gzip 压缩
    // open: true, // 打开默认浏览器
    hot: true, // 热更新
    publicPath: '/',
    contentBase: './dist',
    historyApiFallback: true,
    proxy: {
      '/test': {
        target: 'https://picsum.photos',
        pathRewrite: {
          '/test': '',
        },
        changeOrigin: true,
      },
    },
  },
})
