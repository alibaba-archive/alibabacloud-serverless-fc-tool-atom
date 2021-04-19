const CoreSDK = require('@pandorajs/core-sdk').CoreSDK;
const { Resource } = require('@opentelemetry/resources');
const defaultConfig = require('./pandoraConfig');
const { NodeTracerProvider } = require('@opentelemetry/node');
const config = require('../fc-config.json');

module.exports = (name, mode, extendContext) => {
  const resource = new Resource({
    deployment_alinode: process.version,
    deployment_vendor: 'aliyun_fc',
    deployment_process_pid: process.pid,
    deployment_version: config.version || '',
    deployment_region: config.region,
    project_id: `${config.serviceName}.${config.functionName}`,
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
