import {
  Controller,
  Post,
  Provide,
  Inject,
  Body,
  ALL,
  Param,
} from '@midwayjs/decorator';
import { customConfig } from '../configuration';
import { MetricService } from '../service/metric';

const mock = false;

@Provide()
@Controller(`${customConfig.prefix ?? ''}/api/projects/:proj_id/metrics`)
export class MetricController {
  @Inject()
  ctx;

  @Inject('metricService')
  service: MetricService;

  @Post('/query-subject-metrics')
  async querySubjectMetrics(@Body(ALL) body, @Param('proj_id') projectId) {
    const { metrics, start, end, stepSeconds, labels, groupBy, source } = body;
    if (mock) {
      return this.ctx.ok(
        metrics.map(item => ({ resultType: 'matrix', result: [] }))
      );
    }
    const data = await this.service.querySubjectMetrics(projectId, metrics, {
      start,
      end: end || Date.now(),
      stepSeconds,
      labels,
      source,
      groupBy,
    });
    this.ctx.ok(data);
  }

  @Post('/query-instant-subject-metrics')
  async queryInstantSubjectMetrics(
    @Body(ALL) body,
    @Param('proj_id') projectId
  ) {
    const { metrics, time, windowSeconds, labels, groupBy, source } = body;
    if (mock) {
      return this.ctx.ok(
        metrics.map(item => ({ resultType: 'matrix', result: [] }))
      );
    }

    const data = await this.service.queryInstantSubjectMetrics(
      projectId,
      metrics,
      {
        time,
        windowSeconds,
        labels,
        source,
        groupBy,
      }
    );
    this.ctx.ok(data);
  }

  @Post('/query-platform-metrics')
  async queryPlatformMetrics(@Body(ALL) body, @Param('proj_id') projectId) {
    const { metrics, start, end, stepSeconds, labels, groupBy, source } = body;
    if (mock) {
      return this.ctx.ok(
        metrics.map(item => ({ resultType: 'matrix', result: [] }))
      );
    }
    const data = await this.service.queryPlatformMetrics(projectId, metrics, {
      start,
      end: end || Date.now(),
      stepSeconds,
      labels,
      source,
      groupBy,
    });
    this.ctx.ok(data);
  }

  @Post('/query-instant-platform-metrics')
  async queryInstantPlatformMetrics(
    @Body(ALL) body,
    @Param('proj_id') projectId
  ) {
    const { metrics, time, windowSeconds, labels, groupBy, source } = body;
    if (mock) {
      return this.ctx.ok(
        metrics.map(item => ({ resultType: 'matrix', result: [] }))
      );
    }

    const data = await this.service.queryInstantPlatformMetrics(
      projectId,
      metrics,
      {
        time,
        windowSeconds,
        labels,
        source,
        groupBy,
      }
    );
    this.ctx.ok(data);
  }
}
