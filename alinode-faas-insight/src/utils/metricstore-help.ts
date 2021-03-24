import { SLSLogData } from '../datasource/sls-base';
import { safeParse } from '../exception/json-parse-error';
import { Dict } from '../type';
import { Matrix, QueryResult, Vector } from '../types/metric';
import { groupBy } from './array';

export const parseMetricResult = (list: SLSLogData[]): QueryResult => {
  const resultGroupMap = groupBy(list, 'labels');
  const result: Vector = list.length
    ? Object.entries(resultGroupMap).map(([labelKey, data]) => {
        return {
          metric: safeParse(labelKey) as Dict<string>,
          value: [Number(data[0].time) / 1000, data[0].value],
        };
      })
    : [];
  return {
    resultType: 'vector',
    result,
  };
};

export const parseMetricRangeResult = (list: SLSLogData[]): QueryResult => {
  const resultGroupMap = groupBy(list, 'labels');
  const result: Matrix = Object.entries(resultGroupMap).map(
    ([labelKey, data]) => {
      return {
        metric: safeParse(labelKey) as Dict<string>,
        values: data.map(point => [Number(point.time) / 1000, point.value]),
      };
    }
  );
  return {
    resultType: 'matrix',
    result,
  };
};
