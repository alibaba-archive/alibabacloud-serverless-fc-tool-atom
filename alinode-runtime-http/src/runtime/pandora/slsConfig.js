const config = require('../config.json');
module.exports = {
  endpoint: `alinode-cloud-runtime-${config.region}.${config.region}.log.aliyuncs.com`,
  source: 'alinode-custom-runtime',
  metrics: {
    logstore: 'pandora-metrics',
    topic: 'metrics',
  },
  exceptions: {
    logstore: 'pandora-exceptions',
    topic: 'exceptions',
  },
  traces: {
    logstore: 'pandora-traces',
    topic: 'traces',
  },
};
