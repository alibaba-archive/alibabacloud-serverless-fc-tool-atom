const ExceptionsSLSExporter = require('./ExceptionsSLSExporter');
const MetricsSLSExporter = require('./MetricsSLSExporter');
const TracesSLSExporter = require('./TracesSLSExporter');

require('https');
require('http');
// trigger enable @opentelemetry/plugin-http @opentelemetry/plugin-https
// TODO 排查一下原因，其实 sls-logger-stage 已经 require('https')，但是却没有触发 NodeTracerProvider PluginLoader 的 require hook，所以这里单独再 require 一下

module.exports = class ComponentSLSReporter {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async start() {
    this.startAtAllProcesses();
  }

  async startAtSupervisor() {
    this.startAtAllProcesses();
  }

  startAtAllProcesses() {
    this.metricsSLSExporter = new MetricsSLSExporter(this.ctx);
    this.tracesSLSExporter = new TracesSLSExporter(this.ctx);
    this.exceptionsSLSExporter = new ExceptionsSLSExporter(this.ctx);

    this.ctx.metricsForwarder.addMetricsExporter(this.metricsSLSExporter);
    this.ctx.spanProcessor.addSpanExporter(this.tracesSLSExporter);
    this.ctx.exceptionProcessor.addExceptionExporter(
      this.exceptionsSLSExporter
    );
  }
};
