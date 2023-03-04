/* eslint-disable */
'use strict';

const path = require('path');
const webpack = require('webpack');

const appConfig = require('./webpack.config.app');
const extensionConfig = require('./webpack.config.extension');

/**@type {import('webpack').Configuration}*/
module.exports = (env) => {
  switch (env.entry) {
    case 'app':
      return appConfig;
    case 'extension':
      return extensionConfig;
  }
  throw Error(`Specify 'app' or 'extension' as --env entry=... for webpack build.`);
};