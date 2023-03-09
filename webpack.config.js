/* eslint-disable */
'use strict';

const dotenv = require('dotenv');

var PACKAGE = require('./package.json');
var pingVersion = PACKAGE.version;

const path = require('path');
const webpack = require('webpack');

const appConfig = require('./webpack.config.app');
const extensionConfig = require('./webpack.config.extension');

/**@type {import('webpack').Configuration}*/
module.exports = (env, argv) => {
  dotenv.config({ path: `.env.${argv.mode}` });

  /**@type {import('webpack').Configuration}*/
  const baseConfig = {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.PING_VERSION': JSON.stringify(pingVersion),
        'process.env.NODE_ENV': JSON.stringify(argv.mode),
        'process.env.MB_API_KEY': JSON.stringify(process.env.MB_API_KEY),
        'process.env.ROLLBAR_ACCESS_TOKEN': JSON.stringify(process.env.ROLLBAR_ACCESS_TOKEN),
        'process.env.ROLLBAR_POST_CLIENT_ITEM_ACCESS_TOKEN': JSON.stringify(process.env.ROLLBAR_POST_CLIENT_ITEM_ACCESS_TOKEN),
      }),
    ],
  }

  switch (env.entry) {
    case 'app':
      return {
        ...baseConfig,
        ...appConfig,
      };
    case 'extension':
      return {
        ...baseConfig,
        ...extensionConfig,
      };
  }
  throw Error(`Specify 'app' or 'extension' as --env entry=... for webpack build.`);
};