/* eslint-disable */
'use strict';

const nodeExternals = require('webpack-node-externals');
const path = require('path');
const webpack = require('webpack');

/**@type {import('webpack').Configuration}*/
module.exports = (env) => {
  if (env.entry !== 'app' && env.entry !== 'extension') {
    throw Error(`Specify 'app' or 'extension' as --env entry=... for webpack build.`);
  }

  const entryFilePath = env.entry === 'app' ? './src/index.tsx' : './src/extension.ts';
  const outFileName = env.entry === 'app' ? 'index.js' : 'extension.js';
  const target = env.entry === 'app' ? undefined : 'node';

  return {
    target: target,
    externalsPresets: {
      node: true // in order to ignore built-in modules like path, fs, etc. 
    },
    entry: entryFilePath,
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [{
            loader: 'ts-loader',
            options: {
              configFile: `tsconfig.${env.entry}.json`,
            }
          }],
        },
      ],
    },
    output: {
      filename: outFileName,
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'commonjs2',
      devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    externals: [{
      vscode: 'commonjs vscode'
    }, nodeExternals()],
    resolve: {
      mainFields: ['browser', 'module', 'main'],
      extensions: ['.ts', '.tsx'],
      alias: {
        // provides alternate implementation for node module and source files
      },
      fallback: {
        // Webpack 5 no longer polyfills Node.js core modules automatically.
        // see https://webpack.js.org/configuration/resolve/#resolvefallback
        // for the list of Node.js core module polyfills.
  
        "url": require.resolve("url/"),
        "https": require.resolve("https-browserify"),
        "http": require.resolve("stream-http"),
        "util": require.resolve("util/"),
        "crypto": false,
        "fs": false,
        "path": require.resolve("path-browserify"),
      },
    },
  };
};