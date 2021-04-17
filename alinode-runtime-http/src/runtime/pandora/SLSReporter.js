const fs = require('fs');
const SLSProducer = require('sls-logger-stage/dist/slsProducer').default;
const slsConfig = require('./slsConfig');
const { LOCAL_ACCESS_PATH } = require('./utils');

const DEFAULT_BULK_SIZE = 512;

module.exports = class ExceptionsSLSExporter {
  constructor({ logstore, topic }) {
    this.logger = null;
    this.logQueue = [];
    this.latestAccess = null;
    this.latestUpdateAt = null;
    this.ready = false;

    this.endpoint = slsConfig.endpoint;
    this.source = slsConfig.source;
    this.logstore = logstore;
    this.topic = topic;

    this.updateAccess = this.updateAccess.bind(this);
    this.send = this.send.bind(this);
  }

  _initLogger(access) {
    const { accessKeyId, accessKeySecret, securityToken } = access;
    this.currentAccess = { ...access };
    const logger = new SLSProducer({
      endpoint: this.endpoint,
      accessKey: accessKeyId,
      accessSecret: accessKeySecret,
      securityToken,
      logstore: this.logstore,
      source: 'alinode-custom-runtime',
      topic: this.topic,
      compress: false,
      level: 'INFO',
      disabled: false,
    });

    return logger;
  }

  _writeAccssLocal(access) {
    fs.writeFile(LOCAL_ACCESS_PATH, JSON.stringify(access), () => {
      console.log('update access ok');
    });
  }

  _updateLogger(access) {
    this.logger = this._initLogger(access);
    this.latestUpdateAt = Date.now();
    this._writeAccssLocal(access);
    if (this.logger) {
      this.ready = true;
      this._start();
    }
  }

  updateAccess(access) {
    if (access != null) {
      const now = Date.now();
      if (!this.latestUpdateAt || now - this.latestUpdateAt > 600000) {
        // 10分钟更新一次 sts token
        this._updateLogger({ ...access });
        this.latestAccess = null;
      } else {
        this.latestAccess = { ...access };
      }
    }
  }

  send(message) {
    const logData = {
      level: 'INFO',
      ...message,
    };
    this.logQueue.push({
      Time: Math.floor(Date.now() / 1000),
      Contents: Object.keys(logData).map((k) => ({
        Key: k,
        Value:
          typeof logData[k] === 'object'
            ? JSON.stringify(logData[k])
            : String(logData[k]),
      })),
    });
    this._start();
  }

  async _start() {
    if (this.worker || !this.ready) {
      return;
    }
    this.error = false;
    this.worker = await (async () => {
      while (this.logQueue.length > 0 && !this.error) {
        const logs = this.logQueue.splice(
          0,
          Math.min(this.logQueue.length, DEFAULT_BULK_SIZE)
        );
        try {
          await this.logger.putLogs({
            Logs: logs,
            Topic: this.topic,
            Source: this.source,
          });
        } catch (e) {
          this.error = true;
          if (this.latestAccess != null) {
            console.log(
              '[SLSReporter] Unable to put logs to sls',
              e,
              'try Reset sls report sts token, ',
              this.topic
            );
            this.ready = false;
            this.logQueue.push(...logs);
            this._updateLogger({ ...this.latestAccess });
            this.latestAccess = null;
          } else {
            this.logQueue.push(...logs);
            this.ready = false;
            console.error(
              '[SLSReporter] Unable to put logs to sls and no latest sts token found',
              e,
              this.topic,
              logs
            );
          }
        }
      }
    })();
    this.worker = undefined;
  }
};
