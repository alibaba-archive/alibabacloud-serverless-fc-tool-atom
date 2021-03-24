module.exports = class ExceptionsSLSExporter {
  constructor(ctx) {
    this.type = 'errorLog';
    this.ctx = ctx;
    this.logger = { info: this.ctx.customReport.exceptions.send };
  }

  export(data) {
    for (const record of data) {
      this.logger.info({
          timestamp: record.timestamp,
          level: record.level,
          traceId: record.traceId,
          spanId: record.spanId,
          traceName: record.traceName,
          resource: record.resource,
          name: record.name,
          message: record.message,
          stack: record.stack,
          attributes: {
            ...record.resource.attributes,
            ...record.attributes,
          },
          path: record.path,
        }
      );
    }
  }
};
