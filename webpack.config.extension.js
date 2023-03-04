/* eslint-disable */
'use strict';

const nodeExternals = require('webpack-node-externals');
const path = require('path');
const webpack = require('webpack');

/**@type {import('webpack').Configuration}*/
module.exports = {
  target: 'node',
  externalsPresets: {
    // Ignore built in modules like fs, path, ...
    node: true
  },
  entry: './src/extension.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'ts-loader',
          options: {
            configFile: `tsconfig.extension.json`,
          }
        }],
      },
    ],
  },
  output: {
    filename: 'extension.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  // Exclude all node modules and vscode specific modules (generated on the fly).
  externals: [{
    vscode: 'commonjs vscode'
  }, nodeExternals()],
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.ts', '.tsx'],
    alias: {
    },
    fallback: {
      // Some node modules have following deps:
      "url": require.resolve("url/"),
      "https": require.resolve("https-browserify"),
      "http": require.resolve("stream-http"),
      "util": require.resolve("util/"),
      "crypto": false,
      "fs": false,
      "path": require.resolve("path-browserify"),
    },
  }
};