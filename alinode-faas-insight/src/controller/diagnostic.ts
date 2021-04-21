import {
  Controller,
  Get,
  Provide,
  Inject,
  ALL,
  Param,
  Query,
} from '@midwayjs/decorator';
// import { notNullableAnd } from '../utils';
import { customConfig } from '../configuration';
import { DiagnosticService } from '../service/diagnostic';

@Provide()
@Controller(`${customConfig.prefix ?? ''}/api/projects/:proj_id/diagnostics`)
export class DiagnosticController {
  @Inject()
  ctx;

  @Inject('diagnosticService')
  service: DiagnosticService;

  @Get('/list-report')
  async query(@Query(ALL) query, @Param('proj_id') projectId) {
    const { data, nextMarker } = await this.service.listReport(projectId);

    return this.ctx.ok(data, { nextMarker });
  }

  @Get('/report')
  async getReport(@Query('ossPath') ossPath) {
    const { data } = await this.service.getReport(ossPath);
    return this.ctx.ok(data);
  }
}
