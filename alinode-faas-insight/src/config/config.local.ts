import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // add your config here
  config.middleware = ['error', 'login', 'mock'];

  config.assets = {
    preflightPath: '//127.0.0.1:3333/',
    publicPath: '//127.0.0.1:3333/',
  };
  return config;
};
