import assert from '@quentinadam/assert';
import AuthenticationStringBuilder from './AuthenticationStringBuilder.ts';
import RsaSha256Signer from './RsaSha256Signer.ts';
import TimeProvider from './TimeProvider.ts';
import RandomNonceGenerator from './RandomNonceGenerator.ts';
import BaseStringBuilder from './BaseStringBuilder.ts';

Deno.test('AuthenticationStringBuilder', async () => {
  const vector = {
    method: 'POST' as const,
    url: 'https://api.ibkr.com/v1/api/oauth/live_session_token',
    consumerKey: 'ZCSGTLJAN',
    accessToken: 'c69a36406472d1f5b6de',
    diffieHellmanChallenge: '7d04de39dec12123f206ba594052de12115dc493fa70b1b7497f640d6f6574f',
    randomNonce: '39b86f02-97c8-41ac-8578-b8103e15b096',
    time: new Date(1772724660 * 1000),
    realm: 'realm',
    signer: new RsaSha256Signer([
      '-----BEGIN PRIVATE KEY-----',
      'MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAMk4vbeIq23vLetv',
      'z6iDxirk3AfgaPHYmJgciHGp7Wwb9GpR5zd/xUqhLx+M6yhpFFYghtfrV7dE5u+K',
      'EtZYe29N9mDGlMVrP+t+qMuBQg7Nc9AaICrgd7v26hyfgBdax3dUrzvnerPj13zA',
      'HjAY2O4UGwCLgz/1rn5uQAIHdFqBAgMBAAECgYEAjLFWvUAbFRe6FLcuC9ZvNcil',
      'LAC1f/wA3cJ9iHPW5NM69yfjMgPtb3v51eaS+cNXC81cWxZbU3IiwnPZLfPaAUCJ',
      '4D4K7Rw/ATE/jUSSQRWlfcmEUTt2+PY1+pVzO+004rPfV8eZQyyMcOm0CNX0t9B8',
      'cIQ2wuWb3cmdoCZERkECQQDp9Yo6Cf6GBAx3RKssmqAQ3KocDKFR2yIiCXuaPt4J',
      'tAnOBG8VRra1IGA85NhiY1kKM5zWS4i8vfkBLnn7vrDJAkEA3C2pWOt/tWTqEohO',
      '/X+VnuqJ8y6ADie/LuyoiEI3WnIj0PhhDy6MfnIHcbzlQ2uRBUyK4kRxDosUvUTf',
      '6Jmv+QJBAJlAVrAX9dpxcnz5xSqtiqYg9Wj0OQO2iBBFp+psveMbRMTnkKAeNvZE',
      'Y+XffYJNU3jkQBr7VXFU+3PzrsHhskkCQBbsLhBS3EXfTrtFM6wSp1oXIuuNcMmI',
      'e8//1X/yHN8uuOndogU5nGjhqELAHsJJJZz+ngr2gyq3ch5OWF1X+skCQGwdXjCp',
      'YjT+BeFTOocV8ypY8UaHjhpV2msJSwaXVzHJgCbUg4UMJF0NCpgHx0sUFeI5qpKU',
      'w+LuJGheHwVb8OY=',
      '-----END PRIVATE KEY-----',
    ].join('\n')),
    signaturePayloadBuiler: new BaseStringBuilder(
      'be35c67ffb0452d0547c0d929565f7d1404cef05a63b582c496e3c401fd92603',
    ),

    authenticationString:
      'realm="realm", diffie_hellman_challenge="7d04de39dec12123f206ba594052de12115dc493fa70b1b7497f640d6f6574f", oauth_consumer_key="ZCSGTLJAN", oauth_nonce="39b86f02-97c8-41ac-8578-b8103e15b096", oauth_signature="BhZ12VDqyJfNrCTyVIG5VGY5TLT29JOmlJ3e2kaPZE7%2B4bYKPaTaRdG3T37UdsnpV3TRLEhuEZUEeRF1p7MIx7%2BN3L3PhOMNzgkWWylAK%2BJvh%2Fnoid3VGTE%2FO5mSXRUze3sfY4F37%2F994tnhDTdICGdAI8KGD6qC3YvNgLQ3rrA%3D", oauth_signature_method="RSA-SHA256", oauth_timestamp="1772724660", oauth_token="c69a36406472d1f5b6de"',
  };
  const authenticationStringBuilder = new AuthenticationStringBuilder({
    consumerKey: vector.consumerKey,
    accessToken: vector.accessToken,
    realm: vector.realm,
    randomNonceGenerator: new RandomNonceGenerator(vector.randomNonce),
    timeProvider: new TimeProvider(vector.time),
  });
  assert(
    await authenticationStringBuilder.buildAuthenticationString({
      method: vector.method,
      url: vector.url,
      signer: vector.signer,
      additionalAuthenticationParams: {
        diffie_hellman_challenge: vector.diffieHellmanChallenge,
      },
      signaturePayloadBuiler: vector.signaturePayloadBuiler,
    }) === vector.authenticationString,
  );
});
