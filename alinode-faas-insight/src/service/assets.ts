import { Provide, Config, Scope, ScopeEnum } from '@midwayjs/decorator';

export interface AssetsData {
  preflightPath: string;
  publicPath: string;
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class AssetsService {
  @Config('assets')
  private config: AssetsData;

  getAssetsPublicPath() {
    return this.config?.publicPath;
  }

  getAssetsPreflightPath() {
    return this.config?.preflightPath ?? '//127.0.0.1:3333/';
  }
}
