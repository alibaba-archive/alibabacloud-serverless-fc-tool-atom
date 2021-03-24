import { Configuration } from '@midwayjs/decorator';

export const customConfig = {
  prefix: '/insight',
};

@Configuration({
  namespace: 'insightFaasCore',
})
export class InsightFaasCoreConfiguration {}
