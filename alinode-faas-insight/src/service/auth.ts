import { Provide, Inject, Config } from '@midwayjs/decorator';
import { Context } from 'egg';
import { customConfig } from '../configuration';
import { safeAssert } from '../index';

interface ILoginUser {
  username: string;
  password: string;
}

@Provide()
export class AuthService {
  @Inject()
  private ctx: Context;

  @Config('loginUser')
  private config;

  async login(user: ILoginUser) {
    const { username, password } = user;

    safeAssert(username === this.config.username, 'incorrect user name', 400);
    safeAssert(password === this.config.password, 'incorrect password', 400);

    await this.ctx.login({
      username,
    });
  }

  logout() {
    this.ctx.logout();
    this.ctx.redirect(`${customConfig.prefix ?? ''}/login`);
  }
}
