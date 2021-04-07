import { Provide, Inject } from '@midwayjs/decorator';
import { PaginationOptions } from '../type';
import * as assert from 'assert';
import { TraceDb } from '../datasource/trace';

import {
  nullableAnd,
  nonNullableOf,
  buildBaseQl,
  notNullableAnd,
} from '../utils';

const defaultPageSize = 20;

@Provide()
export class TraceService {
  @Inject('trace')
  traceDb: TraceDb;

  private parseTraceResult = (trace: any) => {
    const status: string[] = [];
    if (trace.statusCode === '0') {
      status.push(Status.successful);
    } else {
      status.push(Status.failed);
    }

    return {
      ...trace,
      duration: notNullableAnd(trace.duration, Number(trace.duration)),
      startTime: notNullableAnd(trace.startTime, Number(trace.startTime)),
      endTime: notNullableAnd(trace.endTime, Number(trace.endTime)),
      canonicalCode: notNullableAnd(trace.statusCode, Number(trace.statusCode)),
      traceStatus: status,
    };
  };

  allowedQueryOrderFields = ['duration', 'startTime'];
  async query(projectId: string, options?: TraceListOptions) {
    assert(options?.start != null, '[trace query]: start time is necessary');
    assert(
      notNullableAnd(options?.maxDuration, !isNaN(options?.maxDuration)) ??
        true,
      '[trace query]: max duration must be number'
    );
    assert(
      notNullableAnd(options?.minDuration, !isNaN(options?.minDuration)) ??
        true,
      '[trace query]: max duration must be number'
    );
    const startTime = options.start;
    const endTime = options.end ?? Date.now();
    const filterNullName = options?.name === 'null' ? `AND name IS null` : '';
    let ql = buildBaseQl({
      'attributes.project_id': projectId,
      ...nonNullableOf({
        name: filterNullName ? null : options?.name,
        '__tag__:__path__': options?.version,
        '__tag__:__region__': options?.region,
        kind: nullableAnd(options?.traceId, 1),
      }),
    });
    const statusCodeFilter =
      notNullableAnd(
        options?.status,
        options?.status === Status.successful
          ? 'and "status.code" = 0'
          : 'and "status.code" > 0'
      ) ?? '';
    const durationFilter = [
      notNullableAnd(
        options?.minDuration,
        `and duration >= ${options?.minDuration}`
      ),
      notNullableAnd(
        options?.maxDuration,
        `and duration <= ${options?.maxDuration}`
      ),
    ].join(' ');
    const traceIdFilter = [
      notNullableAnd(options?.traceId, `and traceId = '${options?.traceId}'`),
    ].join(' ');
    const filterQl = `where startTime >= ${startTime} and startTime <= ${endTime} ${statusCodeFilter} ${durationFilter} ${filterNullName} ${traceIdFilter}`;
    const queryQl = `${ql} | select attributes, context, duration, endTime, ended, events, kind, links, name, parentSpanId, spanId, startTime, "status.code" as statusCode, traceId ${filterQl}`;

    const orderBy: [string, string][] = [['startTime', 'DESC']];

    if (options?.orderBy) {
      assert(
        this.allowedQueryOrderFields.includes(options?.orderBy),
        `[trace query]: expect a order options in ${this.allowedQueryOrderFields}`
      );
      orderBy.unshift([options?.orderBy, options?.orderType ?? 'DESC']);
    }

    const pageSize = options.pageSize ?? defaultPageSize;
    const pageQl = `limit ${
      notNullableAnd(options?.pageNumber, options.pageNumber * pageSize) ?? 0
    }, ${pageSize}`;

    const [result, countResult] = await Promise.all([
      this._query(
        `${queryQl} ORDER BY ${orderBy
          .map(([order, type]) => `${order} ${type}`)
          .join(',')} ${pageQl}`,
        {
          start: startTime,
          end: endTime,
        }
      ),
      this._query(`${ql} | select count(*) as count ${filterQl}`, {
        start: startTime,
        end: endTime,
      }),
    ]);

    const count = Number(countResult?.[0]?.count ?? 0);

    return { data: result?.map(this.parseTraceResult), count };
  }

  allowedOverviewOrderFields = ['duration', 'count', 'failureCount', 'name'];
  async overview(projectId: string, options?: TraceOverviewOptions) {
    const orderBy = options?.orderBy ?? this.allowedOverviewOrderFields[0];
    const orderDesc = options?.orderDesc ?? true;

    assert(
      this.allowedOverviewOrderFields.includes(orderBy),
      `expect a order options in ${this.allowedOverviewOrderFields}`
    );

    assert(options?.start != null, '[trace query]: start time is necessary');
    const startTime = options.start;
    const endTime = options.end ?? Date.now();

    const filterQl = `WHERE startTime >= ${startTime} and startTime <= ${endTime}`;

    const result = await this._query(
      `${buildBaseQl({
        'attributes.project_id': projectId,
        kind: 1,
        ...nonNullableOf({
          '__tag__:__path__': options?.version,
          '__tag__:__region__': options?.region,
        }),
      })} | select name, count(1) as count, avg(duration) as duration, sum(if("status.code" > 0, 1, 0)) as failureCount ${filterQl} GROUP BY name order by ${orderBy} ${
        orderDesc ? 'desc' : ''
      }`,
      { start: startTime, end: endTime }
    );
    return result?.map(item => ({
      count: Number(item.count),
      failureCount: Number(item.failureCount),
      duration: Number(item.duration),
      name: item.name,
    }));
  }

  async trend(projectId: string, options?: TraceQueryOptions) {
    const filterNullName = options?.name === 'null' ? `AND name IS null` : '';
    const ql = buildBaseQl({
      'attributes.project_id': projectId,
      kind: 1,
      ...nonNullableOf({
        name: filterNullName ? null : options?.name,
        '__tag__:__path__': options?.version,
        '__tag__:__region__': options?.region,
      }),
    });
    assert(options?.start != null, '[trace query]: start time is necessary');
    const startTime = options.start;
    const endTime = options.end ?? Date.now();

    const filterQl = `WHERE startTime >= ${startTime} and startTime <= ${endTime}`;
    const window = Math.max(Math.floor((endTime - startTime) / 48), 15 * 1000);

    const result = await this._query(
      `${ql} | select startTime - startTime % ${
        window ?? 6000
      } as timestamp, count(1) as count, avg(duration) as duration, sum(if("status.code" > 0, 1, 0)) as failureCount ${filterQl} ${filterNullName} GROUP BY timestamp`,
      { start: startTime, end: endTime }
    );
    return result.map(item => ({
      count: Number(item.count),
      failureCount: Number(item.failureCount),
      duration: Number(item.duration),
      timestamp: Number(item.timestamp),
    }));
  }

  private async _query(queryQl: string, options) {
    return this.traceDb.query(queryQl, options);
  }
}

export interface TraceQueryOptions {
  start?: number;
  end?: number;
  name?: string;
  stage?: string;
  sn?: string;
  version?: string;
  region?: string;
}

export interface OrderOptions {
  orderBy?: string;
  orderDesc?: boolean;
}

export type TraceOverviewOptions = TraceQueryOptions & OrderOptions;

export interface TraceDeploymentOptions {
  deploymentUnit?: string;
  replicaId?: string;
  projectVersion?: string;
  pid?: string;
}

enum Status {
  successful = 'successful',
  failed = 'failed',
}

enum OrderType {
  DESC = 'DESC',
  ASC = 'ASC',
}

export interface TraceListOptions extends TraceQueryOptions, PaginationOptions {
  orderBy?: string;
  orderType?: OrderType;
  traceId?: string;
  kind?: number;
  status?: Status;
  canonicalCode?: number;
  minDuration?: number;
  maxDuration?: number;
}
