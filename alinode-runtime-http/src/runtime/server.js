'use strict';

const createCoreSdk = require('./pandora');
const express = require('express');
const util = require('util');
const { Resource } = require('@opentelemetry/resources');
const slsConfig = require('./pandora/slsConfig');
const SLSReport = require('./pandora/SLSReporter');
const { customContext } = require('./pandora/utils');
const { handler } = require('../index');

const metricsSlsReport = new SLSReport(slsConfig.metrics);
const tracesSlsReport = new SLSReport(slsConfig.traces);
const exceptionsSlsReport = new SLSReport(slsConfig.exceptions);

const updateSlsReportAccess = function (headers) {
  const access = {
    accessKeyId: headers['x-fc-access-key-id'] || '',
    accessKeySecret: headers['x-fc-access-key-secret'] || '',
    securityToken: headers['x-fc-security-token'] || '',
  };
  metricsSlsReport.updateAccess(access);
  tracesSlsReport.updateAccess(access);
  exceptionsSlsReport.updateAccess(access);
};

const app = express();

app.post('/initialize', (req, res) => {
  console.log('alinode insight custom runtime initializer done.');
  updateSlsReportAccess(req.headers);
  res.end('done');
});

app.get('/pre-stop', (req, res) => {
  console.log('alinode insight custom runtime pre-stop running.');

  updateSlsReportAccess(req.headers);
  setTimeout(() => {
    console.log('alinode insight custom runtime pre-stop done.');
  }, 18000);
});

app.get('/pre-freeze', (req, res) => {
  console.log('alinode insight custom runtime pre-freeze running.');

  updateSlsReportAccess(req.headers);
  setTimeout(() => {
    console.log('alinode insight custom runtime pre-freeze done.');
  }, 18000);
});

app.use(async function (req, res, next) {
  const headers = req.headers;
  const rid = headers['x-fc-request-id'];
  updateSlsReportAccess(headers);

  console.log(`FC Invoke Start RequestId: ${rid}`);
  console.log('request start at ===>', new Date());
  await next();
  const calResponseTime = () => {
    console.log('request end at ===>', new Date());
    console.log(`FC Invoke End RequestId: ${rid}`);
  };
  res.once('finish', calResponseTime);
});

app.post('/*', (req, res) => {
  console.error('mock test error'); // TODO 调试好去掉
  const headers = req.headers;

  handler(req, res, customContext(headers));
});

async function initWithPandora() {
  const coreSdk = createCoreSdk('code-server', 'worker', {
    customReport: {
      metrics: metricsSlsReport,
      traces: tracesSlsReport,
      exceptions: exceptionsSlsReport,
    },
  });
  await coreSdk.start();

  const exceptionProcessor = coreSdk.coreContext.exceptionProcessor;
  const originConsoleError = console.error;

  console.error = function () {
    const error = new Error(util.format(arguments));

    exceptionProcessor.export({
      timestamp: Date.now(),
      level: 'ERROR',
      traceId: 'traceId',
      spanId: 'spanId',
      traceName: 'CustomRuntimeRequest',
      resource: new Resource({
        from: 'console',
      }),
      name: error.name,
      message: error.message,
      stack: error.stack,
      attributes: error,
      path: 'console',
    });

    originConsoleError.apply(console, arguments);
  };

  const server = app.listen(9000, '0.0.0.0');
  console.log(`Alinode Custom Runtime running on http://0.0.0.0:9000.`);

  server.timeout = 0;
  server.keepAliveTimeout = 0;
}

initWithPandora()
  .then(() => {
    console.log('Alinode Custom Runtime server started.');
  })
  .catch((error) => {
    console.error('Alinode Custom Runtime server failed, ', error);
  });
