import { Context, EggApplication } from 'egg';

export default (config: unknown, app: EggApplication) => {
  return async function assert(ctx: Context, next: Function) {
    ctx.headers['x-fc-access-key-id'] = '';
    ctx.headers['x-fc-access-key-secret'] = '';
    ctx.headers['x-fc-security-token'] = '';
    ctx.headers['x-fc-account-id'] = '';

    await next();
  };
};
