module.exports = {
  components: {
    logger: {
      path: require.resolve('@pandorajs/component-logger'),
    },
    metric: {
      path: require.resolve('@pandorajs/component-metric'),
    },
    trace: {
      path: require.resolve('@pandorajs/component-trace'),
    },
    instrumentNode: {
      path: require.resolve('@pandorajs/component-instrument-node'),
    },
    // TODO 差一个 express instrument 待实现，用以实现 express rpc 相关指标采集。
    instrumentRpcMetric: {
      path: require.resolve('./ComponentInstrumentRpcMetric'),
    },
    reporterSLS: {
      path: require.resolve('./ComponentSLSReporter'),
    },
  },
  trace: {
    plugins: {
      http: {
        enabled: true,
        path: require.resolve('@opentelemetry/plugin-http'),
      },
      https: {
        enabled: true,
        path: require.resolve('@opentelemetry/plugin-https'),
      },
    },
  },
};
