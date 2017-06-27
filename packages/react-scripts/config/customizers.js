'use strict';

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

// Options copied from webpack.config.prod.js

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.
// To have this structure working with relative paths, we have to use custom options.
const paths = require('./paths');
const publicPath = paths.servedPath;
const cssFilename = 'static/css/[name].[contenthash:8].css';
const shouldUseRelativeAssetPaths = publicPath === './';
const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? // Making sure that the publicPath goes back to to build folder.
    { publicPath: Array(cssFilename.split('/').length).join('../') }
  : {};

const postcssLoader = {
  loader: require.resolve('postcss-loader'),
  options: {
    ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
    plugins: () => [
      require('postcss-flexbugs-fixes'),
      autoprefixer({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9', // React doesn't support IE8 anyway
        ],
        flexbox: 'no-2009',
      }),
    ],
  },
};
const prodCssLoader = {
  loader: require.resolve('css-loader'),
  options: {
    importLoaders: 1,
    minimize: true,
    sourceMap: true,
  },
};

module.exports = {
  'BABEL_STAGE_0': {
    toArray: 'presets',
    getDev: function () {
      return require.resolve('babel-preset-stage-0')
    }
  },
  'DECORATORS': {
    toArray: 'babelPlugins',
    getDev: function () {
      return require.resolve('babel-plugin-transform-decorators-legacy')
    }
  },
  'SASS': {
    toArray: 'rules',
    fileRegex: /\.(scss|sass)/,
    getDev: function () {
      return {
        test: /(\.scss|\.sass)$/,
        use: [
          require.resolve("style-loader"),
          require.resolve("css-loader"),
          postcssLoader,
          require.resolve("sass-loader")
        ]
      }
    },
    getProd: function () {
      return {
        test: /(\.scss|\.sass)$/,
        use: [
          ExtractTextPlugin.extract(
            Object.assign(
              {
                fallback: require.resolve('style-loader'),
                use: [
                  prodCssLoader,
                  postcssLoader,
                  require.resolve('sass-loader')
                ],
              },
              extractTextPluginOptions
            )
        ),
        ]
      }
    }
  },
  'LESS': {
    toArray: 'rules',
    fileRegex: /\.less$/,
    getDev: function () {
      return {
        test: /\.less$/,
        use: [
          require.resolve('style-loader'),
          require.resolve('css-loader'),
          postcssLoader,
          require.resolve('less-loader')
        ]
      }
    },
    getProd: function () {
      return {
        test: /\.less/,
        use: 
          ExtractTextPlugin.extract(
            Object.assign(
              {
                fallback: require.resolve('style-loader'),
                use: [
                  prodCssLoader,
                  postcssLoader,
                  require.resolve('less-loader')
                ],
              },
              extractTextPluginOptions
            )
          )
      }
    }
  },
  'STYLUS': {
    toArray: 'rules',
    fileRegex: /\.styl$/,
    getDev: function () {
      return {
        test: /\.styl/,
        use: [
          require.resolve('style-loader'),
          prodCssLoader,
          postcssLoader,
          require.resolve('stylus-loader')
        ]
      }
    },
    getProd: function () {
      return {
        test: /\.styl/,
        use:
         ExtractTextPlugin.extract(
            Object.assign(
              {
                fallback: require.resolve('style-loader'),
                use: [
                  prodCssLoader,
                  postcssLoader,
                  require.resolve('stylus-loader')
                ],
              },
              extractTextPluginOptions
            )
          )
      }
    }
  },
  // TODO
  'CSS_MODULES': {
    config: {
      dev: 'style!css?modules&camelCase&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss',
      prod: 'style!css?modules&camelCase&-autoprefixer&importLoaders=1!postcss'
    }
  }
}
