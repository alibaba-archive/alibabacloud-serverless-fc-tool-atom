import { Provide, Inject } from '@midwayjs/decorator';
import { Dict } from '../type';
import type * as metricstore from '../types/metric';
import { MetricStore } from '../datasource/metricstore';
import { safeAssert } from '../error';
import { ReadableProject } from '../interface';

import { ql, parsePromResult, fcMetricsQl } from '../utils/metric-ql';
import { ProjectService } from './project';

@Provide()
export class MetricService {
  @Inject('SLSFactory')
  clientFactory;

  @Inject('metricstore')
  private metricstore: MetricStore;

  @Inject('projectService')
  private projectService: ProjectService;

  async querySubjectMetrics(
    projectId: string,
    metricSubjects: string[],
    options: SubjectMetricsOptions = {}
  ): Promise<metricstore.QueryResult[]> {
    const stepSeconds = options.stepSeconds ?? 300;

    const queries = metricSubjects.map(item => {
      const gen = ql[item];
      safeAssert(gen, `Subject metric '${item}' not recognizable`);
      return gen(projectId, options.labels ?? {}, {
        stepSeconds: stepSeconds,
        groupBy: options.groupBy,
      });
    });

    return this._querySubjectMetrics(projectId, queries, {
      ...options,
      stepSeconds,
    });
  }

  async queryInstantSubjectMetrics(
    projectId: string,
    metricSubjects: string[],
    options: InstantSubjectMetricsOptions = {}
  ): Promise<metricstore.QueryResult[]> {
    const windowSeconds = options.windowSeconds ?? 300;

    const queries = metricSubjects.map(item => {
      const gen = ql[item];
      safeAssert(gen, `Subject metric '${item}' not recognizable`);
      return gen(projectId, options.labels ?? {}, {
        stepSeconds: windowSeconds,
        groupBy: options.groupBy,
      });
    });

    return this._queryInstantSubjectMetrics(projectId, queries, {
      ...options,
      windowSeconds,
    });
  }

  private async _querySubjectMetrics(
    projectId: string,
    queries: (string | string[])[],
    options: SubjectMetricsOptions = {}
  ): Promise<metricstore.QueryResult[]> {
    const optStart = options.start;
    const optEnd = options.end;
    safeAssert(
      optStart != null && optStart > 0 && Number.isSafeInteger(optStart),
      'start must be safe positive integer'
    );
    safeAssert(
      optEnd != null &&
        optEnd > 0 &&
        Number.isSafeInteger(optEnd) &&
        optEnd > optStart,
      'end must be safe positive integer'
    );
    const stepSeconds = options.stepSeconds ?? 300;

    let resultData: metricstore.QueryResult[];
    const iql = queries as string[];
    resultData = await Promise.all(
      iql.map(qs =>
        this.metricstore.queryRange({
          query: qs,
          start: optStart / 1000,
          end: optEnd / 1000,
          step: `${stepSeconds}s`,
        })
      )
    );
    resultData = resultData.map(item => parsePromResult(item));

    return resultData;
  }

  private async _queryInstantSubjectMetrics(
    projectId: string,
    queries: string[],
    options: InstantSubjectMetricsOptions = {}
  ): Promise<metricstore.QueryResult[]> {
    const queryTime = options.time ?? Date.now();

    let resultData: metricstore.QueryResult[];
    const iql = queries as string[];
    resultData = await Promise.all(
      iql.map(qs =>
        this.metricstore.query({
          query: qs,
          time: queryTime / 1000,
          windowSeconds: options.windowSeconds,
        })
      )
    );
    resultData = resultData.map(item => parsePromResult(item));

    return resultData;
  }

  async queryPlatformMetrics(
    projectId: string,
    metricSubjects: string[],
    options: SubjectMetricsOptions = {}
  ): Promise<metricstore.QueryResult[]> {
    const project = await this.projectService.getProject(projectId);

    const stepSeconds = options.stepSeconds ?? 300;

    const queries = await Promise.all(
      metricSubjects.map(item => {
        return this.generateSubjectMetricsQl(projectId, item, {
          stepSeconds,
          labels: options.labels,
          groupBy: options.groupBy,
          project,
        });
      })
    );

    return this._querySubjectMetrics(projectId, queries, {
      ...options,
      stepSeconds,
    });
  }

  async queryInstantPlatformMetrics(
    projectId: string,
    metricSubjects: string[],
    options: InstantSubjectMetricsOptions = {}
  ): Promise<metricstore.QueryResult[]> {
    const project = await this.projectService.getProject(projectId);

    const windowSeconds = options.windowSeconds ?? 300;

    const queries = await Promise.all(
      metricSubjects.map(item => {
        return this.generateSubjectMetricsQl(projectId, item, {
          stepSeconds: windowSeconds,
          labels: options.labels,
          groupBy: options.groupBy,
          project,
        });
      })
    );

    return this._queryInstantSubjectMetrics(projectId, queries, {
      ...options,
      windowSeconds,
    });
  }

  private defaultMetricsMap: Dict<string> = {
    system_cpu_percent: 'system_load_1min',
    system_mem_percent: 'system_mem_used_percent',
  };
  generateSubjectMetricsQl(
    projectId: string,
    metric: string,
    options: GenerateSubjectMetricsQlOptions
  ) {
    const stepSeconds = options.stepSeconds ?? 300;

    const project = options.project;

    const appPlatformGen = fcMetricsQl[metric];
    if (appPlatformGen) {
      return appPlatformGen(project, options.labels ?? {}, {
        stepSeconds: stepSeconds,
        groupBy: options.groupBy,
      });
    }
    const fallbackGen = ql[this.defaultMetricsMap[metric] ?? metric];
    safeAssert(fallbackGen, `Subject metric '${metric}' not recognizable`);
    return fallbackGen(projectId, options.labels ?? {}, {
      stepSeconds: stepSeconds,
      groupBy: options.groupBy,
    });
  }
}

export interface InstantSubjectMetricsOptions {
  source?: 'tsdb' | 'metricstore';
  time?: number;
  labels?: Dict<string>;
  windowSeconds?: number;
  groupBy?: string[];
}

export interface SubjectMetricsOptions {
  source?: 'tsdb' | 'metricstore';
  start?: number;
  end?: number;
  labels?: Dict<string>;
  stepSeconds?: number;
  groupBy?: string[];
}

export interface GenerateSubjectMetricsQlOptions {
  labels?: Dict<string>;
  stepSeconds?: number;
  groupBy?: string[];
  project?: ReadableProject;
}
