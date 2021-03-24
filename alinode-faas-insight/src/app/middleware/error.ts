import { Context, EggApplication } from 'egg';
import { ErrorMessage, ErrorStatusCode } from '../../error';

export default (config: unknown, app: EggApplication) => {
  return async function assert(ctx: Context, next: Function) {
    try {
      await next();
    } catch (e) {
      if (e[ErrorStatusCode]) {
        ctx.status = e[ErrorStatusCode];
        ctx.body = { ok: false, message: e[ErrorMessage] };
        return;
      }
      if (app.config.env === 'local') {
        throw e;
      } else {
        ctx.status = 500;
        console.log('[Custom logger], ', e);
        ctx.logger.error(e, 'uncaught exception');
        ctx.body = { ok: false, message: 'Internal server error' };
        throw e;
      }
    }
  };
};
