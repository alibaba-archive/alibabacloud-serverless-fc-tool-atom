import { getCredential } from '@serverless-devs/core';
import { Component } from '@serverless-devs/s-core';
import { getRole, getPolicys, RoleName } from './policys';
import RamCompoent from './components/ram';
import fs from 'fs';
import path from 'path';

export default class AliNodeFaasCustomRuntime extends Component {
  private async creatRam(inputs: any, region, accountId) {
    const ram = new RamCompoent();
    const role = getRole(accountId);
    const policys = getPolicys(accountId, region);
    await ram.create({
      ...inputs,
      Properties: {
        statement: role.Statement,
        name: role.RoleName,
        description: role.Description,
        policys: [
          {
            name: policys.PolicyName,
            statement: policys.Statement,
          },
        ],
      },
    });
  }
  async deploy(inputs: any) {
    // 输入的inputs参数结构

    const {
      Region: region = 'cn-zhangjiakou',
      reportOssBucket = 'alinode-insight',
    } = inputs.Properties;

    await fs.writeFileSync(
      path.resolve('./runtime/fc-config.json'),
      JSON.stringify({
        region,
        bucket: reportOssBucket,
        functionName: inputs.Properties.Function.Name,
        serviceName: inputs.Properties.Service.Name,
      })
    );

    const aliyunAccess = await getCredential('alibaba');

    const { AccountID } = aliyunAccess;

    // 创建 sts role policys
    await this.creatRam(inputs, region, AccountID);

    // 发布，并绑定角色到对应的 service、function
    const fcDeploy = await this.load('fc', 'Component', 'alibaba');
    return await fcDeploy.deploy({
      ...inputs,
      Properties: {
        ...inputs.Properties,
        Service: {
          ...inputs.Properties.Service,
          Role: RoleName,
        },
      },
    });
  }
  async sync(inputs: any) {
    const fc = await this.load('fc', 'Component', 'alibaba');
    return await fc.sync(inputs);
  }
}
