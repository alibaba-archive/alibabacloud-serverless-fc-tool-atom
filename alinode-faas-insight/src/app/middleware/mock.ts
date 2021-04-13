import { Context, EggApplication } from 'egg';

export default (config: unknown, app: EggApplication) => {
  return async function assert(ctx: Context, next: Function) {
    ctx.headers['x-fc-access-key-id'] = 'STS.NUJ9zYLagd9ErPqemujSWceWY';
    ctx.headers['x-fc-access-key-secret'] =
      'F5vJA61Ugejk7CahaLsZd9MYiQg24qX35CaofpDU27HS';
    ctx.headers['x-fc-security-token'] =
      'CAIShgJ1q6Ft5B2yfSjIr5b/csDtob5G0/uucHbAgW0gZtx7jKD8uzz2IHlMf3VpAuwetvw+lGFX7/YZlqZdVplOWU3Da+B364xK7Q758z8Hcy/yv9I+k5SANTW5KXyShb3/AYjQSNfaZY3eCTTtnTNyxr3XbCirW0ffX7SClZ9gaKZ8PGD6F00kYu1bPQx/ssQXGGLMPPK2SH7Qj3HXEVBjt3gX6wo9y9zmmJTHtEWB1AGglb5P+96rGPX+MZkwZqUYesyuwel7epDG1CNt8BVQ/M909vcdoWyb54rBWwEJskXXbLOEqccfJQt4YK82FqBNpePmmOV/oPDIk5/tzBJALV/Y0qNT2WHLGoABFzjbeCNyk4kdqj/oSUvgtP3cjRCr1mJtfDtVAtdETc0UKGm/wJOYq6rD8rxx6vnh25nMVtotfTf3Iav3KYlxvPUp6OvrfoqOWfwEjdtxoN7JRGvjdE6jtgfR4LF12Hg8vUyby67mIH1iyPP75Vh32wSs0wqDgeFsolMy/21SF5c=';
    ctx.headers['x-fc-account-id'] = '1213677042792422';

    await next();
  };
};
