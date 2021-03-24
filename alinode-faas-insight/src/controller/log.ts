import {
  Controller,
  Get,
  Provide,
  Inject,
  Query,
  Param,
  ALL,
} from '@midwayjs/decorator';
import { customConfig } from '../configuration';
import { FcLogService } from '../service/fc-log';
import { notNullableAnd } from '../utils';

@Provide()
@Controller(`${customConfig.prefix ?? ''}/api/projects/:proj_id/`)
export class LogController {
  @Inject()
  ctx;
  @Inject('fcLogService')
  service: FcLogService;

  @Get('/fc/query-log')
  async queryLog(@Query(ALL) queryParam, @Param('proj_id') projectId) {
    const {
      unit,
      stage,
      from,
      to,
      requestId,
      offset,
      limit,
      query,
      reverse,
    } = queryParam;
    const result = await this.service.listLog(projectId, {
      unit,
      stage,
      from: Math.floor(Number(from) / 1000),
      to: Math.floor(Number(to) / 1000),
      requestId,
      offset: notNullableAnd(offset, Number(offset)),
      limit: notNullableAnd(limit, Number(limit)),
      query,
      reverse: notNullableAnd(reverse, reverse === 'true'),
    });
    this.ctx.ok(result);
  }

  @Get('/fc/list-request-id')
  async listRequestId(@Query(ALL) query, @Param('proj_id') projectId) {
    const { unit, stage, from, to, offset, limit, reverse } = query;
    const result = await this.service.listRequestId(projectId, {
      unit,
      stage,
      from: Math.floor(Number(from) / 1000),
      to: Math.floor(Number(to) / 1000),
      offset: notNullableAnd(offset, Number(offset)),
      limit: notNullableAnd(limit, Number(limit)),
      reverse: notNullableAnd(reverse, reverse === 'true'),
    });
    this.ctx.ok(result);
  }

  @Get('/fc/list-initialization-request-id')
  async listInitializationRequestId(
    @Query(ALL) query,
    @Param('proj_id') projectId
  ) {
    const { unit, stage, from, to, offset, limit, reverse } = query;
    const result = await this.service.listInitializationRequestId(projectId, {
      unit,
      stage,
      from: Math.floor(Number(from) / 1000),
      to: Math.floor(Number(to) / 1000),
      offset: notNullableAnd(offset, Number(offset)),
      limit: notNullableAnd(limit, Number(limit)),
      reverse: notNullableAnd(reverse, reverse === 'true'),
    });
    this.ctx.ok(result);
  }

  @Get('/fc/list-log-context')
  async listLogContext(@Query(ALL) query) {
    const { stage, unit, packId, backLines, forwardLines, packMeta } = query;
    const result = await this.service.listLogContext({
      stage,
      unit,
      packId,
      backLines: notNullableAnd(backLines, Number(backLines)) as number,
      forwardLines: notNullableAnd(
        forwardLines,
        Number(forwardLines)
      ) as number,
      packMeta,
    });
    this.ctx.ok(result);
  }
}
