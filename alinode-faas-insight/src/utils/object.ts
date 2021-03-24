import { Dict } from '../type';

export function pick<T, R extends keyof T>(it: T, ...keys: R[]): Pick<T, R> {
  return keys.reduce((accu, key) => {
    accu[key] = it[key];
    return accu;
  }, {} as Pick<T, R>);
}

type NonNullableOf<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export function nonNullableOf<T extends {}>(it: T): NonNullableOf<T> {
  const keys = Object.keys(it).concat(
    Object.getOwnPropertySymbols(it) as any[]
  ) as (keyof T)[];
  return keys.reduce((accu: any, key) => {
    if (it[key] != null) {
      accu[key] = it[key]!;
    }
    return accu;
  }, {} as NonNullableOf<T>);
}

export function notNullableAnd<T, R>(condition: T, ret: R): R | undefined {
  if (condition != null) {
    return ret;
  }
  return undefined;
}

export function nullableAnd<T, R>(condition: T, ret: R): R | undefined {
  if (condition == null) {
    return ret;
  }
  return undefined;
}

export function reverseDict(dict: Dict<string>): Dict<string> {
  const newDict: Dict<string> = {};
  for (const [key, val] of Object.entries(dict)) {
    newDict[val] = key;
  }
  return newDict;
}
