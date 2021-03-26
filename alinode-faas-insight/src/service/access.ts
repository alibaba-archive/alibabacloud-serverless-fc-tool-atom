import { Provide, Inject } from '@midwayjs/decorator';

@Provide()
export class AccessService {
  @Inject()
  ctx;

  getSTSAccess() {
    const { headers } = this.ctx;

    return {
      accountId: headers['x-fc-account-id'],
      accessKeyID: headers['x-fc-access-key-id'],
      accessKeySecret: headers['x-fc-access-key-secret'],
      securityToken: headers['x-fc-security-token'],
    };
  }
}
