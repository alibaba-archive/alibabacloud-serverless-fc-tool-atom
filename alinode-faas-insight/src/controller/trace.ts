import {
  Controller,
  Get,
  Provide,
  Inject,
  ALL,
  Param,
  Query,
} from '@midwayjs/decorator';
import { Context } from 'egg';
import { customConfig } from '../configuration';
import { TraceService } from '../service/trace';
import { notNullableAnd } from '../utils';

@Provide()
@Controller(`${customConfig.prefix}/api/projects/:proj_id/traces`)
export class TraceController {
  @Inject()
  ctx: Context;

  @Inject('traceService')
  service: TraceService;

  @Get('/')
  async query(@Query(ALL) query, @Param('proj_id') projectId) {
    const {
      start,
      end,
      pageNumber,
      pageSize,
      name,
      traceId,
      canonicalCode,
      status,
      minDuration,
      maxDuration,
      orderBy,
      orderType,
      stage,
      sn,
      version,
      region,
    } = query;
    const { data, count } = await this.service.query(projectId, {
      start: notNullableAnd(start, Number(start)),
      end: notNullableAnd(end, Number(end)),
      pageSize: notNullableAnd(pageSize, Number(pageSize)),
      pageNumber: notNullableAnd(pageNumber, Number(pageNumber)),
      minDuration: notNullableAnd(minDuration, Number(minDuration)),
      maxDuration: notNullableAnd(maxDuration, Number(maxDuration)),
      name,
      traceId,
      canonicalCode,
      status: status,
      orderBy,
      orderType,
      stage,
      sn,
      version,
      region,
    });
    this.ctx.ok(data, { count });
  }

  @Get('/overview')
  async overview(@Query(ALL) query, @Param('proj_id') projectId) {
    const {
      start,
      end,
      name,
      orderBy,
      orderDesc,
      stage,
      sn,
      version,
      region,
    } = query;
    const data = await this.service.overview(projectId, {
      start: notNullableAnd(start, Number(start)),
      end: notNullableAnd(end, Number(end)),
      name,
      orderBy,
      orderDesc: notNullableAnd(orderDesc, orderDesc === 'true'),
      stage,
      sn,
      version,
      region,
    });
    this.ctx.ok(data);
  }

  @Get('/trend')
  async trend(@Query(ALL) query, @Param('proj_id') projectId) {
    const { start, end, name, stage, sn, version, region } = query;
    const data = await this.service.trend(projectId, {
      start: notNullableAnd(start, Number(start)),
      end: notNullableAnd(end, Number(end)),
      name,
      stage,
      sn,
      version,
      region,
    });
    this.ctx.ok(data);
  }
}
