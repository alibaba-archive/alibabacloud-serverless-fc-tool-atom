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
import { ProjectService } from '../service/project';

@Provide()
@Controller(`${customConfig.prefix ?? ''}/api/projects`)
export class ProjectController {
  @Inject()
  ctx: Context;

  @Inject('projectService')
  service: ProjectService;

  @Get('/list-services')
  async listServices(@Query(ALL) query) {
    const { data, nextToken } = await this.service.listServices(query);

    this.ctx.ok(data, { nextToken });
  }

  @Get('/:service/list-functions')
  async listFunctions(@Param('service') serviceName, @Query(ALL) query) {
    const { data, nextToken } = await this.service.listFunctions(
      serviceName,
      query
    );

    this.ctx.ok(data, { nextToken });
  }
}
