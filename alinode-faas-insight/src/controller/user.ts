import { Controller, Get, Provide, Inject } from '@midwayjs/decorator';
import { Context } from 'egg';
import { customConfig } from '../configuration';
import { UserService } from '../service/user';

@Provide()
@Controller(`${customConfig.prefix}/api/users`)
export class UserController {
  @Inject()
  private ctx: Context;
  @Inject('userService')
  private service: UserService;

  @Get('/whoami')
  async getUser(): Promise<void> {
    const user = await this.service.whoami();
    this.ctx.ok(user);
  }
}
