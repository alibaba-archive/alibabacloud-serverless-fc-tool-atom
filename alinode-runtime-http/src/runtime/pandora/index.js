const CoreSDK = require('@pandorajs/core-sdk').CoreSDK;
const { Resource } = require('@opentelemetry/resources');
const defaultConfig = require('./pandoraConfig');
const { NodeTracerProvider } = require('@opentelemetry/node');

module.exports = (name, mode, extendContext) => {
  const resource = new Resource({
    deployment_alinode: process.version,
    deployment_vendor: 'aliyun_fc',
    deployment_process_pid: process.pid,
    deployment_version: 'test',
    deployment_region: 'cn-zhangjiakou',
    project_id: 'ServerlessToolProject.hongyi_test_function',
  });

  defaultConfig.trace.tracerProvider = new NodeTracerProvider({
    plugins: defaultConfig.trace.plugins,
    resource,
  });

  const opts = {
    mode,
    appName: name,
    resource,
    extendContext,
    extendConfig: [
      {
        config: { ...defaultConfig },
        configDir: require.resolve('./pandoraConfig'),
      },
    ],
  };

  const sdk = new CoreSDK(opts);
  sdk.instantiate();
  return sdk;
};
