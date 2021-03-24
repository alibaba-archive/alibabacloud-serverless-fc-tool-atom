import { ErrorStatusCode, ErrorMessage } from '../error';

export class AssertionError extends Error {
  constructor(code: number, message: string) {
    super(message);
    this[ErrorStatusCode] = code;
    this[ErrorMessage] = message;
  }
}

/**
 *
 * @param condition
 * @param message
 * @param code defaults to 400.
 */
export function safeAssert(
  condition: unknown,
  message: string,
  code = 400
): asserts condition {
  if (condition) {
    return;
  }
  throw new AssertionError(code, message);
}
