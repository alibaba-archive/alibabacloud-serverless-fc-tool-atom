import { Plugin, Provide, Config } from '@midwayjs/decorator';
import * as urllib from 'urllib';
import { Dict } from '../';

@Provide()
export class AlinodeInsightClient {
  @Plugin()
  private httpclient: typeof urllib;
  @Config('alinodeClient')
  private config: AlinodeInsightConfig;

  pathMap = {
    project: '/open-api/v1/project-by-scope/get-project-by-id',
    listProject: '/open-api/v1/project-by-scope/projects',
    listVersions: '/open-api/v1/project-by-scope/deployment-versions',
  };
  async get(name: string, options: Dict<string | number>) {
    const path = this.pathMap[name];
    return this.request(path, {
      method: 'GET',
      dataAsQueryString: true,
      data: options,
      dataType: 'json',
    });
  }

  private async request(path: string, options: urllib.RequestOptions) {
    const url = new URL(path, this.config.endpoint).toString();
    const response = await this.httpclient.request(url, {
      ...options,
      headers: {
        ...options.headers,
        'x-alinode-access-key': this.config.name,
        'x-alinode-access-secret': this.config.token,
      },
    });
    if (response.status !== 200 || response.data.ok !== true) {
      throw new AlinodeInsightError(path, response);
    }
    return response.data;
  }
}

export interface AlinodeInsightConfig {
  endpoint: string;
  name: string;
  token: string;
}

export class AlinodeInsightError extends Error {
  name = 'AlinodeInsightError';
  constructor(
    public api: string,
    public response: urllib.HttpClientResponse<unknown>
  ) {
    super('Request alinode-insight failed');
  }
}
