import { Dict } from '../type';

interface Iteratee<T> {
  (v: T): string;
}

export const groupBy = <T>(
  arr: T[],
  iteratee: string | Iteratee<T>
): Dict<T[]> => {
  const groupByData: Dict<T[]> = {};
  arr.forEach(data => {
    const key = typeof iteratee === 'string' ? data[iteratee] : iteratee(data);

    if (groupByData[key]) {
      groupByData[key].push(data);
    } else {
      groupByData[key] = [data];
    }
  });
  return groupByData;
};
