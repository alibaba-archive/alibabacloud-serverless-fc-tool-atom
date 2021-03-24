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
    // const user = this.ctx.user;
    const user = {
      avatar_url:
        'https://img.alicdn.com/tfs/TB1sMyJrsVl614jSZKPXXaGjpXa-144-144.gif',
      lastName: 'aliyun',
    };
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
      userid: it.userid as string,
      workid: it.workid as string,
      bucid: it.bucid as number,
      nickname: it.name as string,
      name: it.lastName as string,
      dep: it.dep as string,
      avatarUrl: it.avatar_url as string,
      htmlUrl: it.html_url as string,
    };
  }
}

// TODO 修改
export interface UserResult {
  /** BUC 登陆名, e.g. chengzhong.wcz */
  userid: string;
  /** 工号, e.g. 238884 */
  workid: string;
  /** BUC id, e.g. 111527064 */
  bucid: number;
  /** 花名, e.g. 昭朗 */
  nickname: string;
  /** 部门, e.g. 阿里集团-CTO线-新零售技术事业群-淘系技术部-前端技术-前端架构-Node架构 */
  dep: string;
  /** 姓名, e.g. 吴成忠 */
  name: string;
  /** 头像 URL, e.g. https://work.alibaba-inc.com/photo/238884.220x220.jpg */
  avatarUrl: string;
  /** 阿里内外 Profile, e.g. https://work.alibaba-inc.com/work/u/238884 */
  htmlUrl: string;
}
