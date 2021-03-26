import { Provide, Inject, Init, Config } from '@midwayjs/decorator';
import { AlinodeInsightClient } from '../manager/alinode-client';
import { UserService } from './user';
import { AccessService } from './access';
import { pick } from '../utils';
import { ReadableProject } from '../interface';

const FCClient = require('@alicloud/fc2');

@Provide()
export class ProjectService {
  @Inject('userService')
  user: UserService;
  @Inject('alinodeInsightClient')
  alinodeInsightClient: AlinodeInsightClient;
  @Inject()
  ctx;
  @Config('currentRegion')
  currentRegion;

  @Inject()
  accessService: AccessService;

  private fcClient: typeof FCClient;

  @Init()
  protected async initializer() {
    const access = this.accessService.getSTSAccess();
    this.fcClient = new FCClient(access.accountId, {
      accessKeyID: access.accessKeyID,
      accessKeySecret: access.accessKeySecret,
      securityToken: access.securityToken,
      region: this.currentRegion,
    });
  }

  private formatServices(services = []) {
    return services.map(service =>
      pick(
        service,
        'serviceName',
        'serviceId',
        'description',
        'createdTime',
        'lastModifiedTime'
      )
    );
  }

  private formatFunctions(functions = []) {
    return functions.map(func =>
      pick(
        func,
        'functionName',
        'functionId',
        'description',
        'createdTime',
        'lastModifiedTime',
        'runtime'
      )
    );
  }

  async listServices(options) {
    const result = await this.fcClient.listServices(options);
    const { data } = result;
    return {
      data: this.formatServices(data?.services ?? []),
      nextToken: data?.nextToken,
    };
  }

  async listFunctions(serviceName, options) {
    const result = await this.fcClient.listFunctions(serviceName, options);
    const { data } = result;

    return {
      data: this.formatFunctions(data?.functions ?? []),
      nextToken: data?.nextToken,
    };
  }

  async getProject(projectId: string) {
    return {} as ReadableProject;
  }
}
