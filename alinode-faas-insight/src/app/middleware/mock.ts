import { Context, EggApplication } from 'egg';

export default (config: unknown, app: EggApplication) => {
  return async function assert(ctx: Context, next: Function) {
    ctx.headers['x-fc-access-key-id'] = 'STS.NUsqvjZVuMj3mA5JWAdCYJWLE';
    ctx.headers['x-fc-access-key-secret'] =
      '9cbXA1Rn3JL7RXctnxQTD395BRvsepH27rNi71zYDj67';
    ctx.headers['x-fc-security-token'] =
      'CAIShgJ1q6Ft5B2yfSjIr5bGOszet4lU+qjYb2eErlcUaMx1pZLnpzz2IHlMf3VpAuwetvw+lGFX7/YZlqZdVplOWU3Da+B364xK7Q75m3kgLSLyv9I+k5SANTW5KXyShb3/AYjQSNfaZY3eCTTtnTNyxr3XbCirW0ffX7SClZ9gaKZ8PGD6F00kYu1bPQx/ssQXGGLMPPK2SH7Qj3HXEVBjt3gX6wo9y9zmmJTHtEWB1AGglb5P+96rGPX+MZkwZqUYesyuwel7epDG1CNt8BVQ/M909vcdoWyb54rBWwEJskXXbLOEqccfJQt4YK82FqBNpePmmOV/oPDIk5/tzBJALV/Y0qNT2WHLGoABVK0BMHyFUrv3gSJvK0Rp2u3DSWuQNzWX6RyO6+qBd6qK/va2VUuhEVgxb02tlMq8ECPnKDROJQFLdD46NB8Y+FExhtdPeFSofgcIPiZeOrcjsfvSL7zjZkA51rHXwmP1rAX8LtbYEE7vnpkloZuuiwElc2mSKqglpPesoAi92Ow=';
    ctx.headers['x-fc-account-id'] = '1213677042792422';

    await next();
  };
};
