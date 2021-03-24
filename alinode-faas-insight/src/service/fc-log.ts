import { Provide, Inject } from '@midwayjs/decorator';
import { SLSFactory } from '../manager/sls-factory';
import { SLSLogData, SlsContextLogSingleData } from '../datasource/sls-base';
import { ProjectService } from './project';
import { pick, nonNullableOf, buildBaseQl } from '../utils';
import { safeAssert } from '../exception/assertion-error';
import { ReadableProject } from '../interface';

interface BaseOptions {
  unit?: string;
  stage: string;
  from: number;
  to: number;
  offset?: number;
  limit?: number;
  reverse?: boolean;
}

interface ListLogOptions extends BaseOptions {
  requestId?: string;
  query?: string;
}

interface ListLogContextOptions {
  stage: string;
  unit: string;
  packId: string;
  backLines: number;
  forwardLines: number;
  packMeta: string;
}

interface SlsLogResult extends SLSLogData {
  functionName: string;
  message: string;
  qualifier: string;
  serviceName: string;
}

type LogResult = {
  functionName: string;
  message: string;
  serviceName: string;
  time: number;
  receiveTime: number;
  packMeta: string;
  packId: string;
};

type RequestIdResult = {
  functionName: string;
  requestId: string;
  serviceName: string;
  time: number;
  receiveTime: number;
};

type InitializationRequestIdResult = {
  functionName: string;
  requestId: string;
  serviceName: string;
  success: boolean;
  time: number;
  receiveTime: number;
};

type SlsContextLogResult = {
  functionName: string;
  message: string;
  serviceName: string;
  time: number;
  receiveTime: number;
  packMeta: string;
  packId: string;
  indexNumber: number;
};

type SlsContextLog = {
  back_lines: number;
  forward_lines: number;
  logs: SlsContextLogResult[];
  progress: string;
  total_lines: number;
};

@Provide()
export class FcLogService {
  @Inject('SLSFactory')
  slsFactory: SLSFactory;

  @Inject()
  projectService: ProjectService;

  private requestIdMark = 'FC Invoke Start RequestId:';
  private initializationMark = 'FC Initialize End RequestId:';

  async listRequestId(
    projId: string,
    { unit, stage, from, to, offset, limit, reverse }: BaseOptions
  ): Promise<RequestIdResult[]> {
    const result = await this.searchFormSLS(projId, unit, stage, {
      from,
      to,
      offset,
      line: limit,
      query: {
        message: this.requestIdMark,
      },
      reverse,
    });
    return this.parseRequestIdResult(result);
  }

  async listInitializationRequestId(
    projId: string,
    { unit, stage, from, to, offset, limit, reverse }: BaseOptions
  ): Promise<InitializationRequestIdResult[]> {
    const result = await this.searchFormSLS(projId, unit, stage, {
      from,
      to,
      offset,
      line: limit,
      query: {
        message: this.initializationMark,
      },
      reverse,
    });
    return this.parseInitializationRequestIdResult(result);
  }

  async listLog(
    projId: string,
    {
      unit,
      stage,
      from,
      to,
      offset,
      limit,
      requestId,
      query,
      reverse,
    }: ListLogOptions
  ): Promise<LogResult[]> {
    const result = await this.searchFormSLS(projId, unit, stage, {
      from,
      to,
      offset,
      line: limit,
      query: {
        message: requestId,
      },
      queryQl: query,
      reverse,
    });
    return query != null
      ? ((result as unknown) as LogResult[])
      : this.parseLogResult(result);
  }

  async listLogContext({
    stage,
    unit,
    packId,
    backLines,
    forwardLines,
    packMeta,
  }: ListLogContextOptions): Promise<SlsContextLog> {
    safeAssert(backLines != null, 'backLines is not present');
    safeAssert(forwardLines != null, 'forwardLines is not present');
    const clientName = this.getClientName(stage, unit);
    const result = await this.slsFactory.invoke(clientName, 'context_log', {
      pack_id: packId,
      back_lines: backLines,
      forward_lines: forwardLines,
      pack_meta: packMeta,
    });

    return {
      ...result,
      logs: this.parseLogContext(result.logs),
    };
  }

  parseRequestIdResult(result: SlsLogResult[]): RequestIdResult[] {
    return result.map(item => ({
      requestId: item.message
        ?.replace(this.requestIdMark, '')
        .replace(/\s|\r/g, ''),
      functionName: item.functionName,
      serviceName: item.serviceName,
      time: Number(item['__time__']) * 1000,
      receiveTime: Number(item['__tag__:__receive_time__']) * 1000,
    }));
  }

  parseInitializationRequestIdResult(
    result: SlsLogResult[]
  ): InitializationRequestIdResult[] {
    const requestIdReg = new RegExp(
      `(${this.initializationMark}\\s)([a-z0-9\\-]*)(\\,)?`
    );
    return result.map(item => ({
      requestId: item.message?.match(requestIdReg)?.[2] ?? '',
      functionName: item.functionName,
      serviceName: item.serviceName,
      success: item.message.indexOf('Error') === -1,
      time: Number(item['__time__']) * 1000,
      receiveTime: Number(item['__tag__:__receive_time__']) * 1000,
    }));
  }

  parseLogResult(result: SlsLogResult[]): LogResult[] {
    return result.map(item => ({
      message: item.message,
      functionName: item.functionName,
      serviceName: item.serviceName,
      time: Number(item['__time__']) * 1000,
      receiveTime: Number(item['__tag__:__receive_time__']) * 1000,
      packMeta: item['__pack_meta__'],
      packId: item['__tag__:__pack_id__'],
      unit: item.unit,
      stage: item.stage,
    }));
  }

  parseLogContext(result: SlsContextLogSingleData[]): SlsContextLogResult[] {
    return result.map(item => ({
      message: item.message,
      functionName: item.functionName,
      serviceName: item.serviceName,
      time: Number(item['__time__']) * 1000,
      receiveTime: Number(item['__tag__:__receive_time__']) * 1000,
      packMeta: item['__pack_meta__'],
      packId: item['__tag__:__pack_id__'],
      indexNumber: Number(item['__index_number__']),
    }));
  }

  private async searchFromSLSByUnit(
    project: ReadableProject,
    unit: string,
    stage: string,
    options: any
  ): Promise<SlsLogResult[]> {
    const clientName = this.getClientName(stage, unit);

    const result: SlsLogResult[] = (await this.slsFactory.invoke(
      clientName,
      'log',
      nonNullableOf({
        ...pick(options, 'from', 'to', 'offset', 'line', 'query', 'reverse'),
        line: options.line || 100,
        query: buildBaseQl(
          {
            serviceName: `${project.scopeNamespace}-prod`,
            functionName: project.scopeExternalName,
            ...options.query,
          },
          options.queryQl,
          true
        ),
      })
    )) as SlsLogResult[];

    return result.map(item => ({
      unit,
      stage,
      ...item,
    }));
  }

  async searchFormSLS(
    projId: string,
    unit: string | undefined,
    stage: string,
    options: any
  ): Promise<SlsLogResult[]> {
    safeAssert(stage != null, '[Query log from sls]: stage is necessary', 400);
    const project = await this.projectService.getProject(projId);
    return await this.searchFromSLSByUnit(project, unit, stage, options);
  }

  getClientName(stage: string, unit: string): string {
    return 'log.deploy';
  }
}
