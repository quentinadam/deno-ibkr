import { assert } from '@quentinadam/assert';
import { BaseStringBuilder } from './BaseStringBuilder.ts';

Deno.test('BaseStringBuilder', () => {
  const vectors: {
    method: 'POST' | 'GET';
    url: string;
    authenticationParams: Record<string, string>;
    prepend?: string;
    payload: string;
  }[] = [
    {
      method: 'POST',
      url: 'https://api.ibkr.com/v1/api/oauth/live_session_token',
      authenticationParams: {
        oauth_consumer_key: 'ZCSGTLJAN',
        oauth_nonce: '39b86f02-97c8-41ac-8578-b8103e15b096',
        oauth_signature_method: 'RSA-SHA256',
        oauth_timestamp: '1772724660',
        oauth_token: 'c69a36406472d1f5b6de',
        diffie_hellman_challenge: '7d04de39dec12123f206ba594052de12115dc493fa70b1b7497f640d6f6574f',
      },
      prepend: 'be35c67ffb0452d0547c0d929565f7d1404cef05a63b582c496e3c401fd92603',
      payload:
        'be35c67ffb0452d0547c0d929565f7d1404cef05a63b582c496e3c401fd92603POST&https%3A%2F%2Fapi.ibkr.com%2Fv1%2Fapi%2Foauth%2Flive_session_token&diffie_hellman_challenge%3D7d04de39dec12123f206ba594052de12115dc493fa70b1b7497f640d6f6574f%26oauth_consumer_key%3DZCSGTLJAN%26oauth_nonce%3D39b86f02-97c8-41ac-8578-b8103e15b096%26oauth_signature_method%3DRSA-SHA256%26oauth_timestamp%3D1772724660%26oauth_token%3Dc69a36406472d1f5b6de',
    },
    {
      method: 'GET',
      url: 'https://api.ibkr.com/v1/api/iserver/marketdata/snapshot?conids=15016128%2C39453424&fields=84%2C86',
      authenticationParams: {
        oauth_consumer_key: 'ZCSGTLJAN',
        oauth_nonce: '39b86f02-97c8-41ac-8578-b8103e15b096',
        oauth_signature_method: 'HMAC-SHA256',
        oauth_timestamp: '1772724660',
        oauth_token: 'c69a36406472d1f5b6de',
      },
      payload:
        'GET&https%3A%2F%2Fapi.ibkr.com%2Fv1%2Fapi%2Fiserver%2Fmarketdata%2Fsnapshot&conids%3D15016128%2C39453424%26fields%3D84%2C86%26oauth_consumer_key%3DZCSGTLJAN%26oauth_nonce%3D39b86f02-97c8-41ac-8578-b8103e15b096%26oauth_signature_method%3DHMAC-SHA256%26oauth_timestamp%3D1772724660%26oauth_token%3Dc69a36406472d1f5b6de',
    },
  ];
  for (const vector of vectors) {
    const signaturePayloadBuilder = new BaseStringBuilder(vector.prepend);
    assert(
      signaturePayloadBuilder.buildSignerPayload({
        method: vector.method,
        url: vector.url,
        authenticationParams: vector.authenticationParams,
      }) === vector.payload,
    );
  }
});
