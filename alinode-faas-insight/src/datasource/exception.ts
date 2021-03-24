import { Provide } from '@midwayjs/decorator';
import { SlsDataSource } from './sls-base';

@Provide('exception')
export class ExceptionDb extends SlsDataSource {
  clientName = 'pandora-exception.deploy';
}
