import { ErrorStatusCode, ErrorMessage } from '../error';

export function parseJSON(str: string, where: string): unknown {
  try {
    return JSON.parse(str);
  } catch (e) {
    throw new JsonParseError(where, str, e.message);
  }
}

export function safeParse(str: string): unknown | undefined {
  try {
    return JSON.parse(str);
  } catch (e) {
    return undefined;
  }
}

export default class JsonParseError extends Error {
  [ErrorStatusCode] = 418;

  constructor(
    public where: string,
    public rawString: string,
    public reason: string
  ) {
    super(`JSON parse failed at ${where}: ${reason}`);
    this[ErrorMessage] = this.message;
  }
}
