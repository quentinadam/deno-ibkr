import Signer from './Signer.ts';

function deserializePEM(pem: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.fromBase64(pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\s+/g, ''));
}

export default class RsaSha256Signer extends Signer {
  constructor(privateKey: string | Uint8Array<ArrayBuffer>) {
    super('RSA-SHA256', async (payload) => {
      const algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
      const keyData = typeof privateKey === 'string' ? deserializePEM(privateKey) : privateKey;
      const key = await crypto.subtle.importKey('pkcs8', keyData, algorithm, false, ['sign']);
      return await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, payload);
    });
  }
}
