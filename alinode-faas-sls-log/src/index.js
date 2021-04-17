/** @format */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getCredential, loadComponent } = require('@serverless-devs/core');
const SLS = require('./sls/index');
const slsConfig = require('./sls/config');

class MyComponent {
  async deploy(inputs) {
    const aliyunAccess = await getCredential('alibaba');

    const { Region: region = 'cn-zhangjiakou' } = inputs.Properties;
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
            logStoreName: slsConfig.logstores.find(
              (item) => item.topic === 'metrics'
            ).name,
          },
        },
        login: {
          username: 'admin',
          password: '123',
        },
      })
    );

    // TODO 初始化 Alinode Insight 项目

    const alinodeDeploy = await loadComponent(
      'alinode-runtime-deploy',
      'http://registry.serverlessfans.cn/simple'
    );
    return await alinodeDeploy.deploy({
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
    const fc = await loadComponent('fc');
    return await fc.sync(inputs);
  }
}
module.exports = MyComponent;
