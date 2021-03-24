const { ValueType, CanonicalCode } = require('@opentelemetry/api');
const {
  GeneralAttribute,
  RpcMetric,
  RpcAttribute,
} = require('@pandorajs/semantic-conventions');

require('https');
require('http');
// trigger enable @opentelemetry/plugin-http @opentelemetry/plugin-https
// TODO 排查一下原因，其实 sls-logger-stage 已经 require('https')，但是却没有触发 NodeTracerProvider PluginLoader 的 require hook，所以这里单独再 require 一下

const {
  hrTimeToMilliseconds,
  extractHttpCanonicalCodeFromSpan,
  extractServiceNameFromSpan,
  isSlsSpan,
} = require('./utils');

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
    const tracerProvider = this.ctx.tracerProvider;
    const meter = this.ctx.meterProvider.getMeter('pandora');

    this._requestCounter = meter.createCounter(RpcMetric.REQUEST_COUNT, {
      valueType: ValueType.INT,
    });

    this._requestErrorCounter = meter.createCounter(
      RpcMetric.RESPONSE_ERROR_COUNT,
      { valueType: ValueType.INT }
    );

    this._requestDurationRecorder = meter.createValueRecorder(
      RpcMetric.RESPONSE_DURATION,
      { description: 'histogram{100,1000,10000}' }
    );

    const spanFinished = this._spanFinished.bind(this);

    tracerProvider.addSpanProcessor({
      onStart: () => {},
      onEnd: spanFinished,
    });
  }

  extractLabelsFromSpan(span) {
    const canonicalCode = extractHttpCanonicalCodeFromSpan(span);
    const attrs = span.attributes;
    const resource = span.resource;
    const serviceName = extractServiceNameFromSpan(span);
    return {
      ...(resource.attributes || {}),
      [GeneralAttribute.COMPONENT]: 'http',
      [RpcAttribute.KIND]: span.kind,
      [RpcAttribute.RESPONSE_CANONICAL_CODE]: String(canonicalCode),
      ['rpc.method']: attrs['http.method'] + ' ' + attrs['http.route'],
      ['rpc.service_name']: serviceName,
      ['rpc.result_code']: attrs['http.status_code'],
    };
  }

  _spanFinished(span) {
    if (isSlsSpan(span)) {
      return;
    }
    console.log('span durtaion', hrTimeToMilliseconds(span.duration));
    const canonicalCode = extractHttpCanonicalCodeFromSpan(span);
    const labels = this.extractLabelsFromSpan(span);
    this._requestCounter.add(1, labels);
    if (canonicalCode !== CanonicalCode.OK) {
      this._requestErrorCounter.add(1, labels);
    }
    this._requestDurationRecorder.record(
      hrTimeToMilliseconds(span.duration),
      labels
    );
  }
};
