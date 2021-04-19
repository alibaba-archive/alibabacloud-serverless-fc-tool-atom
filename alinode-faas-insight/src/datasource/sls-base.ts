import { Inject } from '@midwayjs/decorator';

import { Dict } from '../type';
import { SLSFactory } from '../manager/sls-factory';
export abstract class SlsDataSource {
  @Inject('SLSFactory')
  clientFactory: SLSFactory;

  abstract clientName: string;

  async query(queryQl: string, options) {
    const result = await this.clientFactory.getLogs(this.clientName, {
      // sls query 的 from 和 to 延长3秒，https://help.aliyun.com/document_detail/29029.html，精确的时间控制在分析语句中用 where 控制
      from: Math.round(Number(options.start) / 1000) - 3,
      to:
        Math.round(
          (options.end == null ? Number(options.end) : Date.now()) / 1000
        ) + 3,
      query: queryQl,
      offset: 0,
      line: 100,
    });

    const slsList: any[] = result;

    slsList.sort((a, b) => a.time - b.time);

    return slsList;
  }
}

export interface SLSLogData extends Dict<string> {
  __pack_meta__: string;
  '__tag__:__pack_id__': string;
  '__tag__:__receive_time__': string;
  __time__: string;
  [key: string]: string;
}

export interface SlsContextLogSingleData extends Dict<string> {
  __pack_meta__: string;
  '__tag__:__pack_id__': string;
  __index_number__: string;
  __time__: string;
  [key: string]: string;
}
