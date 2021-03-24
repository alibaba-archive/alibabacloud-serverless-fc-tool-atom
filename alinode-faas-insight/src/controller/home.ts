import {
  Controller,
  Get,
  Provide,
  Inject,
  Priority,
  Config,
} from '@midwayjs/decorator';
import { customConfig } from '../configuration';
import { AssetsService } from '../service/assets';

@Provide()
@Priority(-1)
@Controller(`${customConfig.prefix ?? ''}/`)
export class HomeController {
  @Inject()
  exceptionService;

  @Inject()
  assetsService: AssetsService;

  @Inject()
  ctx;

  @Config('resource')
  resourceConfig;
  @Config('currentRegion')
  currentRegion;
  @Config('currentRegionLabel')
  currentRegionLabel;
  @Config('env')
  env;

  @Get('/exception')
  async exception() {
    try {
      return await this.exceptionService.query('test', {});
    } catch (error) {
      return error.message;
    }
  }

  @Get('/api/*')
  async api() {
    this.ctx.body = { ok: false };
    this.ctx.status = 404;
    // this.ctx.error('Not Found', 404, 404);
  }

  @Get('/preflight/*')
  async preflight() {
    const publicPath = await this.assetsService.getAssetsPreflightPath();

    this.ctx.locals.publicPath = publicPath;
    this.ctx.locals.env = this.env;
    this.ctx.locals.region = {
      value: this.currentRegion,
      label: this.currentRegionLabel,
    };

    if (this.ctx.locals.publicPath) {
      this.ctx.body = await this.ctx.view.render('index.html');
    }
  }

  @Get('/*')
  async index() {
    const publicPath = await this.assetsService.getAssetsPublicPath();

    this.ctx.locals.publicPath = publicPath;
    this.ctx.locals.env = this.env;
    this.ctx.locals.region = {
      value: this.currentRegion,
      label: this.currentRegionLabel,
    };
    this.ctx.locals.title = 'Alinode Insight';

    this.ctx.locals.config = {
      apiPrefix: customConfig.prefix ?? '',
      deployType: 'aliyun',
    };

    if (this.ctx.locals.publicPath) {
      this.ctx.body = await this.ctx.view.render('index.html');
    }
  }
}
