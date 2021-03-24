/** @format */

const SLSClient = require('./client');
const slsConfig = require('./config');
const fs = require('fs');
const path = require('path');

class SLS {
  constructor(options) {
    const slsClient = new SLSClient({
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.secretAccessKey,
      endpoint: options.endpoint,
    });
    this.region = options.region;
    this.slsClient = slsClient;
  }

  async init() {
    const region = this.region;
    const projectName = `${slsConfig.projectName}-${region}`;

    console.log(
      `------------------- start init region:${region} sls config -------------------`
    );

    // 初始化 project
    const project = await this.createProjectIfNotExist(
      projectName,
      slsConfig.projectDescription
    );

    // 初始化 logstore
    await Promise.all(
      slsConfig.logstores.map(async (logstoreConfig) => {
        const logstore = await this.createLogstoreIfNotExist(
          project,
          logstoreConfig.name,
          {
            ttl: logstoreConfig.ttl,
            shardCount: logstoreConfig.shardCount,
          }
        );
        if (logstoreConfig.indexs) {
          // 初始化索引
          await this.insertIndexs(project, logstore, logstoreConfig.indexs);
        }
      })
    );

    // 初始化 metricstore
    const metricstore = await this.createMetricstoreIfNotExist(
      project,
      slsConfig.metricstore
    );

    const { dataJob } = slsConfig;
    const jobScript = await fs.readFileSync(
      path.join(__dirname, './jobScript'),
      'utf-8'
    );

    await this.createDataJob(
      project,
      dataJob.logstore,
      metricstore,
      dataJob.name,
      jobScript,
      dataJob.description
    );

    console.log(
      `------------------- init sls config of region:${region} success -------------------`
    );
  }

  async createProjectIfNotExist(projectName, description) {
    try {
      console.log('[Init sls config] check wheather', projectName, 'exist');
      const project = await this.slsClient.getProject(projectName);
      console.log(
        '[Init sls config] project',
        projectName,
        'already exist, skip...'
      );
      return project.projectName;
    } catch (err) {
      if (err.code === 'ProjectNotExist') {
        console.log('[Init sls config] start create project', projectName);
        await this.slsClient.createProject(projectName, {
          description,
        });
        console.log(
          '[Init sls config] create sls project',
          projectName,
          'success'
        );
        return projectName;
      } else {
        throw err;
      }
    }
  }

  async createLogstoreIfNotExist(projectName, logstoreName, config) {
    try {
      console.log('[Init sls config] check wheather', logstoreName, 'exist');
      const logstore = await this.slsClient.getLogStore(
        projectName,
        logstoreName
      );
      console.log(
        '[Init sls config] logstore',
        logstore.logstoreName,
        'already exist, skip...'
      );
      return logstore.logstoreName;
    } catch (err) {
      if (err.code === 'LogStoreNotExist') {
        console.log('[Init sls config] start create logstore', logstoreName);
        await this.slsClient.createLogStore(projectName, logstoreName, config);
        console.log(
          '[Init sls config] create sls logstore',
          logstoreName,
          'success'
        );
        return logstoreName;
      } else {
        throw err;
      }
    }
  }

  async insertIndexs(projectName, logstoreName, indexs) {
    console.log('[Init sls config] check', projectName, logstoreName, 'indexs');
    let oldIndexs = {};
    let indexExist = false;
    try {
      const res = await this.slsClient.getIndexConfig(
        projectName,
        logstoreName
      );
      indexExist = true;
      const { keys } = res;
      oldIndexs = keys;
      console.log(
        '[Init sls config]',
        logstoreName,
        'already has indexs:',
        Object.keys(oldIndexs).join(',')
      );
    } catch (err) {
      if (err.code !== 'IndexConfigNotExist') {
        throw err;
      }
    }

    const newIndexs = {};
    Object.entries(indexs).forEach(([key, val]) => {
      if (oldIndexs[key] == undefined) {
        newIndexs[key] = val;
      } else {
        newIndexs[key] = oldIndexs[key];
      }
    });

    if (Object.keys(newIndexs).length === 0) {
      return console.log('[Init sls config] no indexs need to insert, skip...');
    }
    const data = {
      keys: newIndexs,
    };
    let index;
    if (indexExist) {
      console.log(
        '[Init sls config] update insert',
        logstoreName,
        'indexs:',
        Object.keys(newIndexs).join(',')
      );
      index = await this.slsClient.updateIndex(projectName, logstoreName, data);
    } else {
      console.log(
        '[Init sls config] create',
        logstoreName,
        'indexs:',
        Object.keys(newIndexs).join(',')
      );
      index = await this.slsClient.createIndex(projectName, logstoreName, data);
    }
    console.log('[Init sls config] create indexs success');

    return index;
  }

  async createMetricstoreIfNotExist(projectName, metricstoreName) {
    try {
      console.log('[Init sls config] check wheather', metricstoreName, 'exist');
      const metricstore = await this.slsClient.getLogStore(
        projectName,
        metricstoreName
      );
      console.log(
        '[Init sls config] metricstore',
        metricstore.logstoreName,
        'already exist, skip...'
      );
      return metricstore.logstoreName;
    } catch (err) {
      if (err.code === 'LogStoreNotExist') {
        console.log(
          '[Init sls config] start create metricstore:',
          metricstoreName
        );
        await this.slsClient.createMetricStore(projectName, metricstoreName);
        console.log(
          '[Init sls config] create sls metricstore:',
          metricstoreName,
          'success'
        );
        return metricstoreName;
      } else {
        throw err;
      }
    }
  }

  async createDataJob(
    projectName,
    logstoreName,
    metricstoreName,
    jobName,
    script,
    description
  ) {
    try {
      console.log(
        '[Init sls config] check wheather dataJob:',
        jobName,
        'exist'
      );
      const job = await this.slsClient.getJob(projectName, jobName);
      console.log(
        '[Init sls config] dataJob:',
        job.name,
        ' already exist, skip...'
      );
      return job.name;
    } catch (err) {
      if (err.code === 'JobNotExist') {
        console.log('[Init sls config] start create dataJob:', jobName);
        await this.slsClient.createJob(
          projectName,
          logstoreName,
          metricstoreName,
          jobName,
          script,
          description
        );
        console.log('[Init sls config] create dataJob:', jobName, 'success');
        return jobName;
      } else {
        throw err;
      }
    }
  }
}

module.exports = SLS;
