import { Component } from '@serverless-devs/s-core';
import { getCredential } from '@serverless-devs/core';
import { getRole, getPolicys, RoleName } from './policys';
import RamCompoent from './components/ram';

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
        // service: 'fc.aliyuns.com',
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

    // 将Args转成Object
    const tempArgs = this.args(inputs.Args, [], []);
    const { region = 'cn-zhangjiakou' } = tempArgs.Parameters;

    const aliyunAccess = await getCredential('alibaba');

    const {
      // AccessKeyID,
      // AccessKeySecret,
      AccountID,
    } = aliyunAccess;

    // 创建 sts role policys
    await this.creatRam(inputs, region, AccountID);

    // 生成 runtime 文件， pandora 文件?

    // 发布，并绑定角色到对应的 service、function
    const fc = await this.load('fc', 'Component', 'alibaba');
    return await fc.deploy({
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
