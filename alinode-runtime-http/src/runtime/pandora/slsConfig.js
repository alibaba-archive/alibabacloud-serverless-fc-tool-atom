module.exports = {
  endpoint:
    'alinode-cloud-runtime-cn-zhangjiakou.cn-zhangjiakou.log.aliyuncs.com',
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
