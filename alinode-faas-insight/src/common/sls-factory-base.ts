export class SLSFactoryBase {
  protected logger: any;

  protected config: SLSConfig;

  protected async getAccess(clientName: string): Promise<SLSClientConfig> {
    return Object.assign({}, this.config[clientName]);
  }
}

export interface SLSConfig {
  [region: string]: SLSClientConfig;
}

export interface SLSClientConfig {
  accessKeyId: string;
  accessKeySecret: string;
  securityToken?: string;
  endpoint: string;
  projectName: string;
  logStoreName: string;
}

export interface SLSClient {
  getLogs(input: GetLogsInput): Promise<any>;
}

export interface GetLogsInput {
  logStoreName?: string;
  topic?: string;
  from: number;
  to: number;
  query?: string;
  line?: number;
  offset?: number;
  reverse?: boolean;
}

export interface CacheClient {
  client: SLSClient;
  projectName: string;
  logStoreName: string;
  endpoint: string;
  access: {
    accessKeyId: string;
    accessKeySecret: string;
  };
}
