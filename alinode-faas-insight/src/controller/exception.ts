import {
  Controller,
  Get,
  Provide,
  Inject,
  ALL,
  Param,
  Query,
} from '@midwayjs/decorator';
import { notNullableAnd } from '../utils';
import { ExceptionService } from '../service/exception';
import { customConfig } from '../configuration';

@Provide()
@Controller(`${customConfig.prefix ?? ''}/api/projects/:proj_id/exceptions`)
export class ExceptionController {
  @Inject()
  ctx;

  @Inject('exceptionService')
  service: ExceptionService;

  @Get('/')
  async query(@Query(ALL) query, @Param('proj_id') projectId) {
    const {
      start,
      end,
      pageNumber,
      pageSize,
      name,
      traceId,
      hasTraceId,
      traceName,
      stage,
      sn,
      version,
      region,
      keyword,
    } = query;
    const { data, count } = await this.service.query(projectId, {
      start: notNullableAnd(start, Number(start)),
      end: notNullableAnd(end, Number(end)),
      pageSize: notNullableAnd(pageSize, Number(pageSize)),
      pageNumber: notNullableAnd(pageNumber, Number(pageNumber)),
      name,
      traceId,
      hasTraceId: hasTraceId === 'true',
      traceName,
      stage,
      sn,
      version,
      region,
      keyword,
    });
    return this.ctx.ok(data, { count });
  }

  @Get('/overview')
  async overview(@Query(ALL) query, @Param('proj_id') projectId) {
    const {
      start,
      end,
      name,
      traceId,
      traceName,
      stage,
      sn,
      version,
      region,
    } = query;
    const data = await this.service.overview(projectId, {
      start: notNullableAnd(start, Number(start)),
      end: notNullableAnd(end, Number(end)),
      name,
      traceId,
      traceName,
      stage,
      sn,
      version,
      region,
    });
    this.ctx.ok(data);
  }

  @Get('/trend')
  async trend(@Query(ALL) query, @Param('proj_id') projectId) {
    const {
      start,
      end,
      window,
      name,
      traceId,
      traceName,
      stage,
      sn,
      version,
      region,
    } = query;
    const data = await this.service.trend(projectId, {
      start: notNullableAnd(start, Number(start)),
      end: notNullableAnd(end, Number(end)),
      window: notNullableAnd(window, Number(window)),
      name,
      traceId,
      traceName,
      stage,
      sn,
      version,
      region,
    });
    this.ctx.ok(data);
  }
}
