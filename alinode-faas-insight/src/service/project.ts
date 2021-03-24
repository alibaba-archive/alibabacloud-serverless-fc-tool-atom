import { Provide, Inject, Config } from '@midwayjs/decorator';
import { ReadableProject } from '../interface';
import { AlinodeInsightClient } from '../manager/alinode-client';
import { UserService } from './user';
import { PaginationOptions } from '..';
// import { nonNullableOf } from '../utils';

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

  async getProject(projectId: string) {
    return {} as ReadableProject;
    // const user = this.user.whoami();
    // const result: ProjectResult = await this.alinodeInsightClient.get(
    //   'project',
    //   {
    //     id: projectId,
    //     userId: user.workid,
    //   }
    // );
    // return result.data;
  }

  async listProject(options: ListProjectOptions) {
    const fcClient = new FCClient('1213677042792422', {
      accessKeyID: 'STS.NUTXHeKS5KH5qgPuKotAWepsW',
      accessKeySecret: 'CZ12hExVG2SY2zviD3mFBBEcpemxMxLbqDPTidYJ8VsB',
      securityToken:
        'CAIShgJ1q6Ft5B2yfSjIr5bhE/LRpowU/Irec0HhkUs6eM57irXYtTz2IHlMf3VpAuwetvw+lGFX7/YZlqZdVplOWU3Da+B364xK7Q75gB01QiDyv9I+k5SANTW5KXyShb3/AYjQSNfaZY3eCTTtnTNyxr3XbCirW0ffX7SClZ9gaKZ8PGD6F00kYu1bPQx/ssQXGGLMPPK2SH7Qj3HXEVBjt3gX6wo9y9zmmJTHtEWB1AGglb5P+96rGPX+MZkwZqUYesyuwel7epDG1CNt8BVQ/M909vcdoWyb54rBWwEJskXXbLOEqccfJQt4YK82FqBNpePmmOV/oPDIk5/tzBJALV/Y0qNT2WHLGoABo/HbOohoFhjMWiFLlBHUsTIfdGMQkMJT8moy03HoefTeEHM+5+BjzuPYVPIoxpHRtbQrvVYVKwS513mJ0Zr8TPmDca+euoA+Hwnu6W/F68vKzEhPErUVe3zUsfTJXXMTawAhGYOibMNGMiyY2yfSkcrrJUEM4QNqHdtwVJc7z7M=',
      region: 'cn-zhangjiakou',
    });
    const result = await fcClient.listServices();

    if (result?.data?.services?.[0]) {
      const functionsResult = await fcClient.listFunctions(
        result.data.services[0].serviceName
      );
      result.data.services[0].functions =
        functionsResult?.data?.functions ?? [];
    }
    // const user = this.user.whoami();
    // const result: ListProjectResult = await this.alinodeInsightClient.get(
    //   'listProject',
    //   {
    //     ...nonNullableOf(options),
    //     userId: user.workid,
    //     attritubeKey: 'fc.units.PUBLISH',
    //     attritubeValue: this.currentRegion,
    //   }
    // );
    return {
      data: result?.data?.services ?? [],
      count: result?.data?.services?.lenght ?? 0,
    };
  }

  async getProjectVersions(id) {
    return [];
    // const project: ReadableProject = await this.getProject(id);
    // const result = await this.alinodeInsightClient.get(
    //   'listVersions',
    //   nonNullableOf({
    //     name: project.name,
    //     scope: project.scope,
    //     scopeExternalId: project.scopeExternalId,
    //     scopeExternalName: project.scopeExternalName,
    //     scopeNamespace: project.scopeNamespace,
    //     type: project.type,
    //   })
    // );

    // return result?.data;
  }
}

export interface ProjectResult {
  data: ReadableProject;
}

export interface ListProjectResult {
  data: ReadableProject[];
  count: number;
}

export interface ListProjectOptions extends PaginationOptions {
  keyword?: string;
}
