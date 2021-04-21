import { Provide, Inject, Config } from '@midwayjs/decorator';
import { safeParse } from '../exception/json-parse-error';
// import { Context } from 'egg';
// import { customConfig } from '../configuration';
// import { safeAssert } from '../index';
// import OSS from 'ali-oss';
import { AccessService } from './access';
const OSS = require('ali-oss');

@Provide()
export class DiagnosticService {
  @Config('currentRegion')
  private region;
  @Config('oss')
  private oss;
  @Inject()
  accessService: AccessService;

  private ossDir = 'diagnostic-report';

  private getOssClient() {
    const stsAccess = this.accessService.getSTSAccess();
    const ossClient = new OSS({
      region: `oss-${this.region}`,
      bucket: `${this.oss.reportBucket}-${this.region}`,
      accessKeyId: stsAccess.accessKeyID,
      accessKeySecret: stsAccess.accessKeySecret,
      stsToken: stsAccess.securityToken,
    });

    return ossClient;
  }

  async listReport(projectId) {
    const client = this.getOssClient();
    const result = await client.listV2({
      prefix: `${this.ossDir}/${projectId}`,
    });
    return {
      data: result.objects ?? [],
      nextMarker: result.nextMarker,
    };
  }

  async getReport(ossPath) {
    const client = this.getOssClient();
    const objectName =
      'diagnostic-report/ServerlessToolProject3.hongyi_test_function_demo_new/2021-4-20/report-14-39-1618929564345.json';
    const result = await client.get(ossPath ?? objectName);
    const data = result?.content?.toString();
    return {
      data: typeof data === 'string' ? safeParse(data) : data,
    };
  }
}
