/** @format */

const { execSync } = require('child_process');
const { Component } = require('@serverless-devs/s-core');
const { getCredential } = require('@serverless-devs/core');
const SLS = require('./sls/index');

class MyComponent extends Component {
  async deploy(inputs) {
    // 输入的inputs参数结构
    console.log('check user input', JSON.stringify(inputs));

    // 将Args转成Object
    const tempArgs = this.args(inputs.Args, [], []);

    const aliyunAccess = await getCredential('alibaba');

    const { region = 'cn-zhangjiakou' } = tempArgs.Parameters;
    // 初始化 sls project logstore
    const slsClient = new SLS({
      accessKeyId: aliyunAccess.AccessKeyID,
      secretAccessKey: aliyunAccess.AccessKeySecret,
      endpoint: `${region}.log.aliyuncs.com`,
      region,
    });
    await slsClient.init();

    await execSync('cnpm install --production');

    // 初始化 Alinode Insight 项目

    // 先用 fc 组件部署，后续等 runtime 组件发布后，用 runtime 组件部署
    const fc = await this.load('fc', 'Component', 'alibaba');
    return await fc.deploy({
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
}
module.exports = MyComponent;
