export const ErrorStatusCode = Symbol.for('alinode.error.status');
export const ErrorMessage = Symbol.for('alinode.error.message');

type ErrorStatusCode = typeof ErrorStatusCode;
type ErrorMessage = typeof ErrorMessage;
declare global {
  interface Error {
    // Refs: https://github.com/microsoft/TypeScript/issues/1863
    // eslint-disable-next-line no-undef
    [ErrorStatusCode]?: number;
    // eslint-disable-next-line no-undef
    [ErrorMessage]?: string;
  }
}

Object.defineProperty(Error.prototype, 'name', {
  get() {
    return this.constructor.name;
  },
  set(value) {
    Object.defineProperty(this, 'name', {
      value,
      writable: true,
      enumerable: false,
      configurable: true,
    });
  },
  enumerable: false,
  configurable: true,
});

export { safeAssert } from './exception/assertion-error';
