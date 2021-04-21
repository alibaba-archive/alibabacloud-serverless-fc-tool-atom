/** @format */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getCredential } = require('@serverless-devs/core');
const { Component } = require('@serverless-devs/s-core');
const SLS = require('./sls/index');
const slsConfig = require('./sls/config');

class MyComponent extends Component {
  async deploy(inputs) {
    const aliyunAccess = await getCredential();

    const {
      Region: region = 'cn-zhangjiakou',
      reportOssBucket = 'alinode-insight',
    } = inputs.Properties;
    const login = inputs.Properties.Function.LoginConfig;
    // 初始化 sls project logstore
    const slsClient = new SLS({
      accessKeyId: aliyunAccess.AccessKeyID,
      secretAccessKey: aliyunAccess.AccessKeySecret,
      endpoint: `${region}.log.aliyuncs.com`,
      region,
    });
    await slsClient.init();

    await execSync('cnpm install --production');

    await fs.writeFileSync(
      path.resolve('./dist/fc-config.json'),
      JSON.stringify({
        region,
        reportOssBucket,
        pandoraSLS: {
          'pandora-exception.deploy': {
            endpoint: `http://${slsConfig.projectName}-${region}.${region}.log.aliyuncs.com`,
            projectName: `${slsConfig.projectName}-${region}`,
            logStoreName: slsConfig.logstores.find(
              (item) => item.topic === 'exceptions'
            ).name,
          },
          'pandora-trace.deploy': {
            endpoint: `http://${slsConfig.projectName}-${region}.${region}.log.aliyuncs.com`,
            projectName: `${slsConfig.projectName}-${region}`,
            logStoreName: slsConfig.logstores.find(
              (item) => item.topic === 'traces'
            ).name,
          },
          'metricstore.deploy': {
            endpoint: `http://${slsConfig.projectName}-${region}.${region}.log.aliyuncs.com`,
            projectName: `${slsConfig.projectName}-${region}`,
            logStoreName: slsConfig.metricstore,
          },
        },
        login: {
          username: String(login.username),
          password: String(login.password),
        },
      })
    );

    // 发布
    const fcDeploy = await this.load('fc', 'Component', 'alibaba');
    return await fcDeploy.deploy({
      ...inputs,
      Properties: {
        ...inputs.Properties,
        Service: {
          ...inputs.Properties.Service,
          Role: 'AlinodeFaasReportSlsRole',
        },
      },
    });
  }

  async sync(inputs) {
    const fc = await this.load('fc');
    return await fc.sync(inputs);
  }
}
module.exports = MyComponent;
