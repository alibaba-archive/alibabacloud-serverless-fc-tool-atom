import { Provide, Inject } from '@midwayjs/decorator';
import { PaginationOptions } from '../type';
import { ExceptionDb } from '../datasource/exception';

import { nonNullableOf, buildBaseQl } from '../utils';
import { safeAssert, notNullableAnd } from '../index';

const defaultPageSize = 20;
@Provide()
export class ExceptionService {
  @Inject('exception')
  exceptionDb: ExceptionDb;

  async query(projectId: string, options?: ExceptionListOptions): Promise<any> {
    const filterNullTraceName =
      options?.traceName === 'null' ? `AND traceName IS null` : '';
    safeAssert(
      options?.start != null,
      '[trace query]: start time is necessary'
    );
    const startTime = options.start;
    const endTime = options.end ?? Date.now();
    const filterQl = `WHERE timestamp >= ${startTime} and timestamp <= ${endTime}`;

    let ql = buildBaseQl({
      'attributes.project_id': projectId,
      ...nonNullableOf({
        name: options?.name,
        traceName: filterNullTraceName ? null : options?.traceName,
        message: options?.keyword,
        '__tag__:__path__': options?.version,
        '__tag__:__region__': options?.region,
      }),
    });

    if (options?.hasTraceId) {
      ql += ' NOT traceId: "" NOT traceId: null';
    }

    const pageSize = options.pageSize ?? defaultPageSize;
    const pageQl = `limit ${
      notNullableAnd(options?.pageNumber, options.pageNumber * pageSize) ?? 0
    }, ${pageSize}`;

    const [result, countResult] = await Promise.all([
      this._query(
        `${ql} | select attributes, level, message, name, path, resource, spanId, stack, timestamp, traceId, traceName ${filterQl} ${filterNullTraceName} ORDER BY timestamp DESC ${pageQl}`,
        options
      ),
      this._query(
        `${ql} | select count(*) as count ${filterQl} ${filterNullTraceName}`,
        { start: startTime, end: endTime }
      ),
    ]);

    const count = Number(countResult?.[0]?.count ?? 0);

    return { data: result, count };
  }

  async overview(projectId: string, options?: ExceptionQueryOptions) {
    safeAssert(
      options?.start != null,
      '[trace query]: start time is necessary'
    );
    const startTime = options.start;
    const endTime = options.end ?? Date.now();
    const filterQl = `WHERE timestamp >= ${startTime} and timestamp <= ${endTime}`;

    const result = await this._query(
      `${buildBaseQl({
        'attributes.project_id': projectId,
        ...nonNullableOf({
          '__tag__:__path__': options?.version,
          '__tag__:__region__': options?.region,
        }),
      })} | select name, count(1) as count ${filterQl} GROUP BY name`,
      { start: startTime, end: endTime }
    );
    return result?.map(item => ({
      count: Number(item.count),
      name: item.name,
    }));
  }

  async trend(projectId: string, options?: ExceptionQueryOptions) {
    const filterNullTraceName =
      options?.traceName === 'null' ? `AND traceName IS null` : '';
    safeAssert(
      options?.start != null,
      '[trace query]: start time is necessary'
    );
    const startTime = options.start;
    const endTime = options.end ?? Date.now();
    const filterQl = `WHERE timestamp >= ${startTime} and timestamp <= ${endTime}`;

    const ql = buildBaseQl({
      'attributes.project_id': projectId,
      ...nonNullableOf({
        name: options?.name,
        traceName: filterNullTraceName ? null : options?.traceName,
        '__tag__:__path__': options?.version,
        '__tag__:__region__': options?.region,
      }),
    });
    const result = await this._query(
      `${ql} | select name, timestamp - timestamp % ${
        options?.window ?? 6000
      } as time, count(1) as count ${filterQl} ${filterNullTraceName} GROUP BY name, time`,
      { start: startTime, end: endTime }
    );
    return result.map(item => ({
      count: Number(item.count ?? 0),
      time: Number(item.time),
      name: item.name,
    }));
  }

  private async _query(queryQl: string, options) {
    return this.exceptionDb.query(queryQl, options);
  }
}

export interface ExceptionQueryOptions extends PaginationOptions {
  start?: number;
  end?: number;
  window?: number;
  traceId?: string;
  traceName?: string;
  name?: string;
  stage?: string;
  sn?: string;
  version?: string;
  region?: string;
}

export interface ExceptionListOptions
  extends ExceptionQueryOptions,
    PaginationOptions {
  keyword?: string;
  hasTraceId?: boolean;
}
