import { Dict } from '../type';

export interface MetricStoreConfig {
  project: string;
  metricStore: string;
}

export interface QueryOptions {
  query: string;
  /** RFC3339 format or a Unix timestamp in seconds */
  time?: string | number;
  windowSeconds?: number;
  timeout?: string;
}

export interface RawResponse<T = unknown> {
  status: 'success' | 'error';
  data: T;
  // Only set if status is "error". The data field may still hold
  // additional data.
  errorType: string;
  error: string;
  // Only if there were warnings while executing the request.
  // There will still be data in the data field.
  warnings: string[];
}

export interface RangeQueryOptions {
  query: string;
  /**
   * <rfc3339 | unix_timestamp>
   */
  start: string | number;
  /**
   * <rfc3339 | unix_timestamp>
   */
  end: string | number;
  /**
   * <duration | float> Query resolution step width in duration format or float number of seconds
   */
  step: string;
}

export type QueryResult =
  | {
      resultType: 'matrix';
      result: Matrix;
    }
  | {
      resultType: 'vector';
      result: Vector;
    }
  | {
      resultType: 'scalar';
      result: Scalar;
    }
  | {
      resultType: 'string';
      result: Scalar;
    };

export type Matrix = RangeVector[];
export type Vector = InstantVector[];

export interface RangeVector {
  metric: {
    [key: string]: string;
  };
  values: Scalar[];
}

export interface InstantVector {
  metric: {
    [key: string]: string;
  };
  value: Scalar;
}

export type Scalar = [/* unix_timestamp */ number, /* value */ string];

export interface MetricStoreRecord {
  metric: string;
  labels: Dict<string>;
  value: number;
  timestamp: number;
}
