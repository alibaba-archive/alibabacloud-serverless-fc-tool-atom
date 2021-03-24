import * as urllib from 'urllib';
import { util as AliYunUtil } from 'aliyun-sdk';
import { Context } from 'egg';
import {
  SLSFactoryBase,
  SLSConfig,
  SLSClientConfig,
} from '../common/sls-factory-base';
import { Provide, Logger, Config, Plugin, Inject } from '@midwayjs/decorator';
import { Dict } from '../type';
import { safeAssert } from '../';

const headers = {
  'x-fc-access-key-id': 'STS.NUUSDzLJKHNgwD7UmdPBd3YUr',
  'x-fc-access-key-secret': '1aVurHoSPZWe2EfTyd5KLmEDuBc5F9r9vtpFvc9HmSh',
  'x-fc-security-token':
    'CAIShgJ1q6Ft5B2yfSjIr5bgGP7OoZVq/4yMdWKGsW0xXM1I3Jz+kDz2IHlMf3VpAuwetvw+lGFX7/YZlqZdVplOWU3Da+B364xK7Q7523w2ZiLyv9I+k5SANTW5KXyShb3/AYjQSNfaZY3eCTTtnTNyxr3XbCirW0ffX7SClZ9gaKZ8PGD6F00kYu1bPQx/ssQXGGLMPPK2SH7Qj3HXEVBjt3gX6wo9y9zmmJTHtEWB1AGglb5P+96rGPX+MZkwZqUYesyuwel7epDG1CNt8BVQ/M909vcdoWyb54rBWwEJskXXbLOEqccfJQt4YK82FqBNpePmmOV/oPDIk5/tzBJALV/Y0qNT2WHLGoABee41ds5UDOt8nEIs6h1uH/0pVVwlJ7PwFthfQ/oQZqDWNvWA/dZJDmlRshDETVMgJ0osFyp39feidRnzhDcpvo4Xpbvwz6Cy5NXYYr4TEAmj8dojviyMeRJlOWqzxz3vp884RV0qWtpo6d97mSfBqOT3zI8oTy+mrBsGmpp3Wtc=',
};

@Provide('SLSFactory')
export class SLSFactory extends SLSFactoryBase {
  static SECRET_NAME = 'alinode-secret';

  @Logger()
  protected logger;

  @Config('sls')
  protected config: SLSConfig;

  @Inject()
  protected ctx: Context;

  @Plugin()
  private httpclient: typeof urllib;

  public async getAccess(clientName: string): Promise<SLSClientConfig> {
    // const { headers } = this.ctx;
    const accessOrigin = this.config[clientName];
    const access = Object.assign(
      {
        accessKeyId: headers['x-fc-access-key-id'],
        accessKeySecret: headers['x-fc-access-key-secret'],
        securityToken: headers['x-fc-security-token'],
      },
      this.ctx.credentials ?? {},
      accessOrigin
    );

    return access;
  }

  getLogs = async (clientName: string, options): Promise<SLSLogData[]> => {
    const result: SLSLogData[] = await this.invoke(clientName, 'log', options);
    return result;
  };

  // 调用sls api https://help.aliyun.com/document_detail/29007.html
  invoke = async <T extends keyof SLSApiData>(
    clientName: string,
    type: T,
    options: Dict<string | number>
  ): Promise<SLSApiData[T]> => {
    const aliyunAccess = await this.getAccess(clientName);
    safeAssert(
      aliyunAccess,
      `[SLSClientFactory]: can not get aliyun access info, clientName: ${clientName}.`
    );

    const {
      accessKeyId,
      accessKeySecret: secretAccessKey,
      securityToken,
      endpoint: endpointConfig,
      projectName,
    } = aliyunAccess;

    const logStoreName = options.logStoreName || aliyunAccess.logStoreName;

    const { hostname: endpoint, protocol } = new URL(endpointConfig);

    const host = `${projectName}.${endpoint}`;
    const path = `/logstores/${logStoreName}`;
    const url = new URL(`${path}`, `${protocol}//${host}`);
    const method = 'GET';
    const params = {
      type,
      projectName,
      logStoreName,
      ...options,
    };
    const headers = this.buildHeader(
      {
        accessKeyId,
        secretAccessKey,
        securityToken,
      },
      method,
      path,
      params
    );

    const reqOptions: urllib.RequestOptions = {
      method,
      data: params,
      dataType: 'json',
      timeout: 10000,
      headers: {
        Host: host,
        ...headers,
      },
    };
    const result = ((await this.httpclient.request(
      url.toString(),
      reqOptions
    )) as unknown) as SLSApiResult;
    const { res } = result;
    safeAssert(
      res.status === 200,
      `[SLSClientFactory invoke] query sls failed, type: type, message: ${res.statusMessage}`
    );
    return res.data;
  };

  buildHeader = (
    credentials: any,
    method: string,
    path: string,
    params: Dict<string | number>
  ) => {
    const date = AliYunUtil.date.rfc822(AliYunUtil.date.getDate());
    const slsHeaders: Dict<string> = {
      Date: date,
      'x-log-apiversion': '0.6.0',
      'x-log-signaturemethod': 'hmac-sha1',
    };

    if (credentials.securityToken) {
      slsHeaders['x-acs-security-token'] = credentials.securityToken;
    }

    // 获取sls签名 https://help.aliyun.com/document_detail/29009.html?spm=a2c4g.11186623.6.1208.54b859469T60sS
    const signature = this.sign(
      credentials.secretAccessKey,
      this.getSignStr(method, slsHeaders, path, params)
    );
    const auth = 'LOG ' + credentials.accessKeyId + ':' + signature;
    slsHeaders['Authorization'] = auth;
    return slsHeaders;
  };

  sign = (secret: string, str: string): string => {
    return AliYunUtil.crypto.hmac(secret, str, 'base64', 'sha1');
  };

  getSignStr = (
    method: string,
    slsHeaders: Dict<string>,
    path: string,
    params: Dict<string | number>
  ): string => {
    const parts = [];
    parts.push(method);
    parts.push(slsHeaders['Content-MD5'] || '');
    parts.push(slsHeaders['Content-Type'] || '');
    parts.push(slsHeaders['Date'] || '');

    const headers = this.canonicalizedAmzHeaders(slsHeaders);
    if (headers) parts.push(headers);
    parts.push(this.canonicalizedResource(path, params));

    return parts.join('\n');
  };

  canonicalizedAmzHeaders = (headers: Dict<string>) => {
    const amzHeaders: string[] = [];

    Object.keys(headers).forEach((name: string) => {
      if (name.match(/^x-log-/i) || name == 'x-acs-security-token') {
        amzHeaders.push(name);
      }
    });

    amzHeaders.sort(function (a, b) {
      return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
    });

    const parts: string[] = [];
    amzHeaders.forEach((name: string) => {
      parts.push(name.toLowerCase() + ':' + String(headers[name]));
    });

    return parts.join('\n');
  };

  canonicalizedResource = (
    path: string,
    params: Dict<string | number>
  ): string => {
    let resource = '';

    resource += decodeURIComponent(path);

    if (params) {
      // collect a list of sub resources and query params that need to be signed
      const resources: SLSResource[] = [];

      Object.entries(params).forEach(([name, param]) => {
        const value = String(param);
        // const value = decodeURIComponent(String(param));

        const resourceParam: SLSResource = { name: name };
        if (value != null) {
          resourceParam.value = value;
        }
        resources.push(resourceParam);
      });

      resources.sort(function (a, b) {
        return a.name < b.name ? -1 : 1;
      });

      if (resources.length) {
        const querystring: string[] = [];
        resources.forEach((resource: SLSResource) => {
          if (resource.value == null) {
            querystring.push(resource.name);
          } else {
            querystring.push(resource.name + '=' + resource.value);
          }
        });

        resource += '?' + querystring.join('&');
      }
    }

    return resource;
  };
}

export interface SlsModel {
  /**
   * MARK: Deployment Control
   */
  query(): any;

  toReadable(): any;
}

interface SLSApiResult {
  headers: Dict<string>;
  res: {
    status: number;
    statusMessage: string;
    data: any;
  };
}

interface SLSResource {
  name: string;
  value?: string;
}

interface SLSLogData extends Dict<string> {
  __pack_meta__: string;
  '__tag__:__pack_id__': string;
  '__tag__:__receive_time__': string;
  __time__: string;
  [key: string]: string;
}

interface SlsContextLogSingleData extends Dict<string> {
  __pack_meta__: string;
  '__tag__:__pack_id__': string;
  __index_number__: string;
  __time__: string;
  [key: string]: string;
}

interface SLSContextLogData {
  back_lines: number;
  forward_lines: number;
  logs: SlsContextLogSingleData[];
  progress: string;
  total_lines: number;
}

interface SLSApiData {
  log: SLSLogData[];
  context_log: SLSContextLogData;
}
