import { Provide, Inject } from '@midwayjs/decorator';
import { Context } from 'egg';
import { IUserOptions } from '../interface';
import { safeAssert, Dict } from '..';

@Provide()
export class UserService {
  @Inject()
  ctx: Context;

  async getUser(options: IUserOptions) {
    return {
      uid: options.uid,
      username: 'mockedName',
      phone: '12345678901',
      email: 'xxx.xxx@xxx.com',
    };
  }

  whoami(): UserResult {
    const user = this.ctx.user;
    safeAssert(
      user != null,
      'No authenticated user found, did you logged in?',
      403
    );
    return this.formatUser(user);
  }

  private formatUser(user: unknown): UserResult {
    const it = user as Dict<unknown>;
    return {
      name: it.username as string,
      avatarUrl:
        'https://img.alicdn.com/tfs/TB1sMyJrsVl614jSZKPXXaGjpXa-144-144.gif',
    };
  }
}

// TODO 修改
export interface UserResult {
  name: string;
  avatarUrl: string;
}
