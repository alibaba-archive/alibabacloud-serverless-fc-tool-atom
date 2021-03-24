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
import { safeAssert } from '../exception/assertion-error';
import { ProjectService } from '../service/project';
import { notNullableAnd } from '../utils';

const mock = true;

@Provide()
@Controller(`${customConfig.prefix ?? ''}/api/projects`)
export class ProjectController {
  @Inject()
  ctx: Context;

  @Inject('projectService')
  service: ProjectService;

  @Get('/')
  async listProject(@Query(ALL) query) {
    if (mock) {
      return this.ctx.ok([], { count: 0 });
    }
    const { pageNumber, pageSize, keyword } = query;
    const { data, count } = await this.service.listProject({
      pageNumber: notNullableAnd(pageNumber, Number(pageNumber)),
      pageSize: notNullableAnd(pageSize, Number(pageSize)),
      keyword: keyword ? keyword : undefined,
    });
    this.ctx.ok(data, { count });
  }

  @Get('/:id')
  async getProject(@Param('id') id) {
    if (mock) {
      return this.ctx.ok({});
    }
    const project = await this.service.getProject(id);
    safeAssert(project, 'not found or permission denied', 404);
    this.ctx.ok(project);
  }

  @Get('/:id/deployments/versions')
  async getVersion(@Param('id') id) {
    const versions = await this.service.getProjectVersions(id);
    this.ctx.ok(versions);
  }
}
