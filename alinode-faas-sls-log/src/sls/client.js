const LogClient = require('@alicloud/log');

class SLSClient extends LogClient {
  async getJob(projectName, jobName) {
    const headers = {
      'x-log-bodyrawsize': 0,
    };
    return this._request(
      'GET',
      projectName,
      `/jobs/${jobName}`,
      {
        project_name: projectName,
        name: jobName,
      },
      null,
      headers,
      {}
    );
  }

  async createJob(
    projectName,
    logstoreName,
    metricstoreName,
    jobName,
    script,
    description
  ) {
    const bodyData = {
      configuration: {
        logstore: logstoreName,
        script,
        sinks: [
          {
            name: metricstoreName,
            project: projectName,
            logstore: metricstoreName,
            accessKeyId: this.accessKeyId,
            accessKeySecret: this.accessKeySecret,
          },
        ],
        accessKeyId: this.accessKeyId,
        accessKeySecret: this.accessKeySecret,
      },
      schedule: {
        type: 'Resident',
      },
      name: jobName,
      type: 'ETL',
      displayName: jobName,
      description,
    };
    const body = Buffer.from(JSON.stringify(bodyData));
    const headers = {
      'x-log-bodyrawsize': body.byteLength,
    };

    return this._request('POST', projectName, '/jobs', {}, body, headers, {});
  }

  async createMetricStore(
    projectName,
    logstore,
    options = {
      ttl: 30,
      shardCount: 2,
      enableTracking: false,
      appendMeta: false,
      autoSplit: true,
      maxSplitShard: 64,
      preserveStorage: false,
    }
  ) {
    const body = Buffer.from(
      JSON.stringify({
        logstoreName: logstore,
        ttl: options.preserveStorage ? 3650 : options.ttl,
        shardCount: options.shardCount,
        enable_tracking: options.enableTracking,
        autoSplit: options.autoSplit,
        maxSplitShard: options.maxSplitShard,
        appendMeta: options.appendMeta,
        telemetryType: 'Metrics',
      })
    );

    await this._request(
      'POST',
      projectName,
      '/logstores',
      {},
      body,
      {},
      options
    );

    await this.createSubstore(projectName, logstore, {
      name: 'prom',
      ttl: options.ttl,
      sortedKeyCount: options.sortedKeyCount,
      timeIndex: options.timeIndex,
      keys: options.keys,
    });
  }

  async listSubstore(projectName, logstore) {
    const headers = {
      'x-log-bodyrawsize': 0,
    };
    return this._request(
      'GET',
      projectName,
      `/logstores/${logstore}/substores`,
      {},
      null,
      headers,
      {}
    );
  }

  async getSubstore(projectName, logstore, name) {
    const headers = {
      'x-log-bodyrawsize': 0,
    };
    return this._request(
      'GET',
      projectName,
      `/logstores/${logstore}/substores/${name}`,
      {},
      null,
      headers,
      {}
    );
  }

  async deleteSubstore(projectName, logstore, name) {
    const headers = {
      'x-log-bodyrawsize': 0,
    };
    return this._request(
      'DELETE',
      projectName,
      `/logstores/${logstore}/substores/${name}`,
      {},
      null,
      headers,
      {}
    );
  }

  async createSubstore(projectName, logstore, options) {
    const {
      name = '',
      ttl = 30,
      sortedKeyCount = 2,
      timeIndex = 2,
      keys = [
        { name: '__name__', type: 'text' },
        { name: '__labels__', type: 'text' },
        { name: '__time_nano__', type: 'long' },
        { name: '__value__', type: 'double' },
      ],
    } = options;
    const body = Buffer.from(
      JSON.stringify({
        name,
        ttl,
        sortedKeyCount,
        timeIndex,
        keys,
      })
    );

    return this._request(
      'POST',
      projectName,
      `/logstores/${logstore}/substores`,
      {},
      body,
      {},
      options
    );
  }
}

module.exports = SLSClient;
