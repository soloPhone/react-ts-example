const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackBar = require('webpackbar')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// terser-webpack-plugin5.x版本不支持webpack4.x
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const { PROJECT_PATH, isDev } = require('../constant')
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin')

const getCssLoaders = (importLoaders) => [
  isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
  {
    loader: 'css-loader',
    options: {
      modules: false,
      sourceMap: isDev,
      importLoaders,
    },
  },
  // {
  //   loader: 'postcss-loader',
  //   options: {
  //     postcssOptions: {
  //       plugins: [
  //         require('postcss-flexbugs-fixes'),
  //         require('postcss-preset-env')({
  //           autoprefixer: {
  //             grid: true,
  //             flexbox: 'no-2009',
  //           },
  //           stage: 3,
  //         }),
  //         require('postcss-normalize'),
  //       ],
  //       sourceMap: isDev,
  //     },
  //   },
  // },
]

module.exports = {
  entry: resolve(PROJECT_PATH, './src/index.tsx'),
  output: {
    // 开发环境中不需要hash值
    filename: `js/[name]${isDev ? '' : '.[hash:8]'}.js`,
    path: resolve(PROJECT_PATH, './dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
      Src: resolve(PROJECT_PATH, './src'),
      Components: resolve(PROJECT_PATH, './src/components'),
      Utils: resolve(),
    },
  },
  // 压缩js
  optimization: {
    minimize: !isDev,
    minimizer: [
      !isDev &&
        new TerserPlugin({
          extractComments: false,
        }),
      !isDev && new OptimizeCssAssetsWebpackPlugin(),
    ].filter(Boolean),
    splitChunks: {
      chunks: 'all',
      name: true,
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: resolve(PROJECT_PATH, './public/index.html'),
      filename: 'index.html',
      cache: false, // 特别重要：防止之后使用v6版本 copy-webpack-plugin 时代码修改一刷新页面为空问题。
      minify: isDev
        ? false
        : {
            removeAttributeQuotes: true,
            collapseWhitespace: true,
            removeComments: true,
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            minifyCSS: true,
            minifyJS: true,
            minifyURLs: true,
            useShortDoctype: true,
          },
    }),
    new WebpackBar({
      name: isDev ? '正在启动' : '正在打包',
      color: '#fa8c16',
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: resolve(PROJECT_PATH, './tsconfig.json'),
      },
    }),
    !isDev &&
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].css',
        ignoreOrder: false,
      }),
    !isDev && new HardSourceWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ].filter(Boolean),
  module: {
    rules: [
      // 处理css文件
      {
        test: /\.css$/i,
        use: getCssLoaders(1),
      },
      // 处理less文件
      {
        test: /\.less$/i,
        use: [
          ...getCssLoaders(2),
          {
            loader: 'less-loader',
            options: {
              sourceMap: isDev,
            },
          },
        ],
      },
      // 处理sass/scss文件
      {
        test: /\.s(a|c)ss$/i,
        use: [
          ...getCssLoaders(2),
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDev,
            },
          },
        ],
      },
      // 处理图片
      {
        test: /\.(gif|bmp|png|jpe?g)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10 * 1024,
              name: '[name].[contenthash:8].[ext]',
              outputPath: '/assets/images',
            },
          },
        ],
      },
      // 处理文字
      {
        test: /\.(ttf|woff|woff2|eot|otf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name].[contenthash:8].[ext]',
              outputPath: '/assets/fonts',
            },
          },
        ],
      },
      // 处理tsx、ts、jsx、js文件
      {
        test: /\.(tsx?|jsx?)$/,
        loader: 'babel-loader',
        options: { cacheDirectory: true },
        exclude: /node_modules/,
      },
    ],
  },
}
