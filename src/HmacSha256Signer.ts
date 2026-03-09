import Signer from './Signer.ts';

export default class HmacSha256Signer extends Signer {
  constructor(secret: Uint8Array<ArrayBuffer>) {
    super('HMAC-SHA256', async (payload) => {
      const algorithm = { name: 'HMAC', hash: 'SHA-256' };
      const key = await crypto.subtle.importKey('raw', secret, algorithm, false, ['sign']);
      return await crypto.subtle.sign('HMAC', key, payload);
    });
  }
}
