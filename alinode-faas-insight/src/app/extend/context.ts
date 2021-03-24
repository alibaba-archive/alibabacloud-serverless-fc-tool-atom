import { Context } from 'egg';

declare module 'egg' {
  interface Context {
    ok: (data: unknown, extra?: object) => void;
    error: (
      message: string,
      code?: string | number,
      httpStatus?: number,
      extra?: object
    ) => void;
  }
}

export function ok(this: Context, data: unknown, extra?: object) {
  this.body = { ...extra, ok: true, data };
}

export function error(
  this: Context,
  message: string,
  code?: string | number,
  httpStatus?: number,
  extra?: object
) {
  this.body = { ...extra, ok: false, code, message };
  this.status = httpStatus ?? 500;
}
