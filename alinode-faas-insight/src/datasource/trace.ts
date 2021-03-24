import { Provide } from '@midwayjs/decorator';
import { SlsDataSource } from './sls-base';

@Provide('trace')
export class TraceDb extends SlsDataSource {
  clientName = 'pandora-trace.deploy';
}
