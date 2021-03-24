const { isSlsSpan } = require('./utils');

module.exports = class TracesSLSExporter {
  constructor(ctx) {
    this.ctx = ctx;
    this.type = 'trace';
    this.logger = { info: this.ctx.customReport.traces.send };
  }

  hrTimeToMilliseconds(hrTime) {
    return Math.round(hrTime[0] * 1e3 + hrTime[1] / 1e6);
  }

  export(spans) {
    for (const it of spans) {
      if (isSlsSpan(it)) {
        continue;
      }
      const resource = it.resource;
      this.logger.info({
        traceId: it.spanContext.traceId,
        spanId: it.spanContext.spanId,
        parentSpanId: it.parentSpanId,
        name: it.name,
        status: it.status,
        startTime: this.hrTimeToMilliseconds(it.startTime),
        endTime: this.hrTimeToMilliseconds(it.endTime),
        duration: this.hrTimeToMilliseconds(it.duration),
        ended: it.ended,
        kind: it.kind,
        context: it.spanContext,
        links: it.links,
        attributes: {
          ...resource.attributes,
          ...it.attributes,
        },
        events: it.events,
        resource,
      });
    }
  }
};
