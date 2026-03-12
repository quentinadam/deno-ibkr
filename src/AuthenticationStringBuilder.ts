import RandomNonceGenerator from './RandomNonceGenerator.ts';
import type RandomNonceGeneratorInterface from './RandomNonceGeneratorInterface.ts';
import type BaseStringBuilder from './BaseStringBuilder.ts';
import type Signer from './Signer.ts';
import TimeProvider from './TimeProvider.ts';
import type TimeProviderInterface from './TimeProviderInterface.ts';

export default class AuthenticationStringBuilder {
  readonly #consumerKey: string;
  readonly #accessToken: string;
  readonly #realm: string;
  readonly #randomNonceGenerator: RandomNonceGeneratorInterface;
  readonly #timeProvider: TimeProviderInterface;

  constructor({ consumerKey, accessToken, realm = 'limited_poa', randomNonceGenerator, timeProvider }: {
    consumerKey: string;
    accessToken: string;
    realm?: string;
    randomNonceGenerator?: RandomNonceGeneratorInterface;
    timeProvider?: TimeProviderInterface;
  }) {
    this.#consumerKey = consumerKey;
    this.#accessToken = accessToken;
    this.#realm = realm;
    this.#randomNonceGenerator = randomNonceGenerator ?? new RandomNonceGenerator();
    this.#timeProvider = timeProvider ?? new TimeProvider();
  }

  async buildAuthenticationString({ method, url, signer, additionalAuthenticationParams, signaturePayloadBuiler }: {
    method: 'GET' | 'POST' | 'DELETE';
    url: string;
    signer: Signer;
    additionalAuthenticationParams?: Record<string, string>;
    signaturePayloadBuiler: BaseStringBuilder;
  }): Promise<string> {
    const authenticationParams: Record<string, string> = {
      oauth_consumer_key: this.#consumerKey,
      oauth_nonce: this.#randomNonceGenerator.randomNonce(),
      oauth_signature_method: signer.method,
      oauth_timestamp: Math.floor(this.#timeProvider.now().valueOf() / 1000).toString(),
      oauth_token: this.#accessToken,
      ...additionalAuthenticationParams,
    };
    const payload = signaturePayloadBuiler.buildSignerPayload({ method, url, authenticationParams });
    authenticationParams.oauth_signature = await signer.sign(payload);
    const entries: [string, string][] = [
      ['realm', this.#realm],
      ...Object.entries(authenticationParams).toSorted(([a], [b]) => a.localeCompare(b)),
    ];
    return entries.map(([key, value]) => `${encodeURIComponent(key)}="${encodeURIComponent(value)}"`).join(', ');
  }
}
