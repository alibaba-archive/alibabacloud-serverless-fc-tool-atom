import type * as urllib from 'urllib';
import { Provide, Inject, Plugin, Logger, Init } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import * as type from '../types/metric';
import { SLSFactory } from '../manager/sls-factory';
import {
  parseMetricResult,
  parseMetricRangeResult,
} from '../utils/metricstore-help';

@Provide('metricstore')
export class MetricStore {
  private config: type.MetricStoreConfig;
  @Logger('metricstore')
  private metricstoreLogger: ILogger;
  @Plugin()
  private httpclient: typeof urllib;

  @Inject('SLSFactory')
  clientFactory: SLSFactory;

  private url: string;
  private projectConfig;

  @Init()
  async init() {
    const {
      accessKeyId,
      accessKeySecret,
      endpoint,
      projectName,
      logStoreName,
    } = await this.clientFactory.getAccess('metricstore.deploy');
    this.projectConfig = {
      accessKeyId,
      accessKeySecret,
    };
    if (this.projectConfig == null) {
      throw new Error(
        `SLS project(${this.config.project}) were not properly configured.`
      );
    }

    this.url = new URL(endpoint).toString();
    this.config = {
      project: projectName,
      metricStore: logStoreName,
    };
  }

  async query(queryOptions: type.QueryOptions): Promise<type.QueryResult> {
    if (this.clientFactory) {
      const data = await this.clientFactory.getLogs('metricstore.deploy', {
        from: Math.floor(
          Number(queryOptions.time) - queryOptions.windowSeconds
        ),
        to: Math.round(Number(queryOptions.time)),
        query: `*| SELECT promql_query('${queryOptions.query}') FROM metrics limit 1000`,
        offset: 0,
        line: 100,
      });
      return parseMetricResult(data);
    }
    const resp = await this.post('api/v1/query', {
      data: {
        query: queryOptions.query,
        time: queryOptions.time,
      },
    });
    const respData = resp.data as type.RawResponse<type.QueryResult>;
    if (isQueryError(respData)) {
      throw new MetricStoreError(respData);
    } else if (resp.status !== 200) {
      throw new Error(
        'MetricStore unknown error with http code: ' + resp.status
      );
    }
    return respData.data;
  }

  async queryRange(
    queryOptions: type.RangeQueryOptions
  ): Promise<type.QueryResult> {
    if (this.clientFactory) {
      const data = await this.clientFactory.getLogs('metricstore.deploy', {
        from: Math.floor(Number(queryOptions.start)),
        to: Math.round(Number(queryOptions.end)),
        query: `*| SELECT promql_query_range('${queryOptions.query}') FROM metrics limit 1000`,
        offset: 0,
        line: 100,
      });
      return parseMetricRangeResult(data);
    }
    const resp = await this.post('api/v1/query_range', {
      data: {
        query: queryOptions.query,
        start: queryOptions.start,
        end: queryOptions.end,
        step: queryOptions.step,
      },
    });
    const respData = resp.data as type.RawResponse<type.QueryResult>;
    if (isQueryError(respData)) {
      throw new MetricStoreError(respData);
    } else if (resp.status !== 200) {
      throw new Error(
        'MetricStore unknown error with http code: ' + resp.status
      );
    }
    return respData.data;
  }

  protected async post(url: string, opts?: urllib.RequestOptions) {
    return this.request(url, {
      method: 'POST',
      ...opts,
      data: {
        ...opts?.data,
      },
      dataAsQueryString: true,
    });
  }

  private async request(path: string, opts?: urllib.RequestOptions) {
    const url = new URL(
      `/prometheus/${this.config.project}/${this.config.metricStore}/${path}`,
      this.url
    );

    const urlString = url.toString();

    this.metricstoreLogger.info('[MetricStore] request', urlString, opts?.data);
    const options: urllib.RequestOptions = {
      dataType: 'json',

      timeout: 10000,
      ...opts,
      headers: {
        ...opts?.headers,
      },
      auth: this.getAuthorization(),
    };
    return this.httpclient.request(urlString, options);
  }

  private getAuthorization() {
    return `${this.projectConfig.accessKeyId}:${this.projectConfig.accessKeySecret}`;
  }
}

export class MetricStoreError extends Error {
  name = 'MetricStoreError';
  type: string;

  constructor(it: type.RawResponse) {
    super(`[MetricStore] ${it.errorType}: ${it.error}`);
    this.type = it.errorType;
  }
}

function isQueryError(resp: type.RawResponse) {
  return resp.status === 'error';
}
