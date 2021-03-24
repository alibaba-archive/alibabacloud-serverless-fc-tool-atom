const {
  RpcKind,
  parseHttpStatusCode,
} = require('@pandorajs/semantic-conventions');
const { endpoint } = require('./slsConfig');

const customContext = function (headers, context = {}) {
  return {
    requestId: headers['x-fc-request-id'],
    credentials: {
      accessKeyId: headers['x-fc-access-key-id'],
      accessKeySecret: headers['x-fc-access-key-secret'],
      securityToken: headers['x-fc-security-token'],
    },
    function: {
      name: headers['x-fc-function-name'],
      handler: headers['x-fc-function-handler'],
      memory: headers['x-fc-function-memory'],
      timeout: headers['x-fc-function-timeout'],
      initializer: headers['x-fc-function-initializer'],
      initializationTimeout: headers['x-fc-initialization-timeout'],
    },
    service: {
      name: headers['x-fc-service-name'],
      logProject: headers['x-fc-service-logproject'],
      logStore: headers['x-fc-service-logstore'],
      qualifier: headers['x-fc-qualifier'],
      versionId: headers['x-fc-version-id'],
    },
    region: headers['x-fc-region'],
    accountId: headers['x-fc-account-id'],
    ...context,
  };
};

const hrTimeToMilliseconds = function (hrTime) {
  return Math.round(hrTime[0] * 1e3 + hrTime[1] / 1e6);
};

const extractHttpCanonicalCodeFromSpan = function (span) {
  return parseHttpStatusCode(Number(span.attributes['http.status_code']));
};

const extractServiceNameFromSpan = function (span) {
  const url = span.attributes['http.url'];
  return typeof url === 'string' &&
    url.split('://')[1] &&
    url.split('://')[1].split('/')[0]
    ? url.split('://')[1].split('/')[0]
    : '';
};

const isSlsSpan = function (span) {
  const serviceName = extractServiceNameFromSpan(span);
  const kind = span.kind;
  return serviceName === endpoint && kind === RpcKind.CLIENT;
};

module.exports = {
  customContext,
  hrTimeToMilliseconds,
  extractHttpCanonicalCodeFromSpan,
  extractServiceNameFromSpan,
  isSlsSpan,
};
