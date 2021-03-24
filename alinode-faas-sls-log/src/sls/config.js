const { exceptionsIndexs, tracesIndexs } = require('./logstore-indexs');

module.exports = {
  projectName: 'alinode-cloud-runtime',
  projectDescription:
    'alinode clound runtime metrics、exceptions、traces 日志存储',
  logstores: [
    {
      name: 'pandora-exceptions',
      topic: 'exceptions',
      indexs: exceptionsIndexs,
      ttl: 30,
      shardCount: 2,
    },
    {
      name: 'pandora-metrics',
      topic: 'metrics',
      ttl: 30,
      shardCount: 2,
    },
    {
      name: 'pandora-traces',
      topic: 'traces',
      indexs: tracesIndexs,
      ttl: 30,
      shardCount: 2,
    },
  ],
  metricstore: 'pandora-metricstore',
  dataJob: {
    logstore: 'pandora-metrics',
    name: 'pandora-metrics-to-metristore',
    description: '加工 sls metrics 日志数据到 metricsoter',
  },
};
