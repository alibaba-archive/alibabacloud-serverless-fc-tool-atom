import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
const fcConfig = require('../fc-config');

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1610349632902_2778';

  // add your config here
  config.middleware = ['error', 'login'];

  config.currentRegion = fcConfig.region;
  config.currentRegionLabel = fcConfig.region;

  config.sls = fcConfig.pandoraSLS;

  config.view = {
    defaultViewEngine: 'xtpl',
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.assets = {
    preflightPath: '//127.0.0.1:3333/',
    publicPath: '//dev.g.alicdn.com/alinode-insight/aliyun/0.0.5/',
  };

  config.loginUser = fcConfig.login;

  return config;
};
