import { Context, EggApplication } from 'egg';
import { customConfig } from '../../configuration';
import { safeAssert } from '../../exception/assertion-error';

const authPath = [
  `${customConfig.prefix ?? ''}/login`,
  `${customConfig.prefix ?? ''}/api/login`,
  `${customConfig.prefix ?? ''}/logout`,
];

export default (config: unknown, app: EggApplication) => {
  return async function assert(ctx: Context, next: Function) {
    const isAuthenticated = ctx.isAuthenticated();
    if (isAuthenticated || authPath.indexOf(ctx.path) > -1) {
      await next();
    } else {
      if (ctx.request.headers.accept?.indexOf('text/html') > -1) {
        ctx.redirect(`${customConfig.prefix ?? ''}/login`);
      } else {
        safeAssert(false, 'need login', 401);
      }
    }
  };
};
