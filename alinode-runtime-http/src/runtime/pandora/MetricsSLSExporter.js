const { ExportResult } = require('@opentelemetry/core');

module.exports = class MetricsSLSExporter {
  constructor(ctx) {
    this.type = 'metrics';
    this.ctx = ctx;
    this.logger = { info: this.ctx.customReport.metrics.send };
  }

  export(data, callback) {
    const timestamp = Date.now();
    for (const record of data) {
      const resource = record.resource;
      const point = record.aggregator.toPoint();
      if (point.value == null) {
        continue;
      }
      if (typeof point.value === 'number') {
        this.logger.info({
          metric: record.descriptor.name,
          timestamp,
          value: point.value,
          tags: {
            ...resource.attributes,
            ...record.labels,
          },
        });
        continue;
      }
      this.logger.info({
        metric: record.descriptor.name + '_count',
        timestamp,
        value: point.value.count,
        tags: {
          ...resource.attributes,
          ...record.labels,
        },
      });
      this.logger.info({
        metric: record.descriptor.name + '_sum',
        timestamp,
        value: point.value.sum,
        tags: {
          ...resource.attributes,
          ...record.labels,
        },
      });
    }
    callback(ExportResult.SUCCESS);
  }

  async shutdown() {}
};
