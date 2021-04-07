import { Context, EggApplication } from 'egg';

export default (config: unknown, app: EggApplication) => {
  return async function assert(ctx: Context, next: Function) {
    ctx.headers['x-fc-access-key-id'] = 'STS.NT4rQuqUerTmPyVLLDBH6Lfv5';
    ctx.headers['x-fc-access-key-secret'] =
      '2PGEGMLV2vQNnei9MQJAGnyfDjyb6ksEPQ4zMTSqjLvK';
    ctx.headers['x-fc-security-token'] =
      'CAIShgJ1q6Ft5B2yfSjIr5eBOevBnIpExZaGUl/nqEwRTscao6Pd1zz2IHlMf3VpAuwetvw+lGFX7/YZlqZdVplOWU3Da+B364xK7Q757Fg7Pi7yv9I+k5SANTW5KXyShb3/AYjQSNfaZY3eCTTtnTNyxr3XbCirW0ffX7SClZ9gaKZ8PGD6F00kYu1bPQx/ssQXGGLMPPK2SH7Qj3HXEVBjt3gX6wo9y9zmmJTHtEWB1AGglb5P+96rGPX+MZkwZqUYesyuwel7epDG1CNt8BVQ/M909vcdoWyb54rBWwEJskXXbLOEqccfJQt4YK82FqBNpePmmOV/oPDIk5/tzBJALV/Y0qNT2WHLGoABTlhjNegXIHyxwykzydW7YB0OvR/4uDvLkc0T4Dl2DiAOunZtT2h7oUDfHleXfGvQrgMMbGfE9ew4GmCffsll/1KkPIrJOw3gRdMHK0A12irHmLSCIGb0sJnBRFYIZpexa6vaLmyh14oAo2LRrQfS/0eSLoI6VhoUE/Golm8iHQo=';
    ctx.headers['x-fc-account-id'] = '1213677042792422';

    await next();
  };
};
