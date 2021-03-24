import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1610349632902_2778';

  // add your config here
  config.middleware = ['error'];

  config.sls = {
    'pandora-exception.deploy': {
      endpoint:
        'http://alinode-cloud-runtime-cn-zhangjiakou.cn-zhangjiakou.log.aliyuncs.com',
      projectName: 'alinode-cloud-runtime-cn-zhangjiakou',
      logStoreName: 'pandora-exceptions',
    },
    'pandora-trace.deploy': {
      endpoint:
        'http://alinode-cloud-runtime-cn-zhangjiakou.cn-zhangjiakou.log.aliyuncs.com',
      projectName: 'alinode-cloud-runtime-cn-zhangjiakou',
      logStoreName: 'pandora-traces',
    },
    'metricstore.deploy': {
      endpoint:
        'http://alinode-cloud-runtime-cn-zhangjiakou.cn-zhangjiakou.log.aliyuncs.com',
      projectName: 'alinode-cloud-runtime-cn-zhangjiakou',
      logStoreName: 'pandora-metricstore',
    },
  };

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
    publicPath: '//127.0.0.1:3333/',
    // publicPath: '//g.alicdn.com/alinode-insight/aliyun/0.0.4/',
  };

  return config;
};
