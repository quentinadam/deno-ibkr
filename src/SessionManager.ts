import * as z from '@quentinadam/zod';
import RsaSha256Signer from './RsaSha256Signer.ts';
import LiveSessionTokenComputer from './LiveSessionTokenComputer.ts';
import type HttpClient from './HttpClient.ts';
import type TimeProviderInterface from './TimeProviderInterface.ts';
import TimeProvider from './TimeProvider.ts';
import type RandomBigIntGeneratorInterface from './RandomBigIntGeneratorInterface.ts';
import BaseStringBuilder from './BaseStringBuilder.ts';

export default class SessionManager {
  readonly #httpClient: HttpClient;
  readonly #timeProvider: TimeProviderInterface;
  readonly #signer: RsaSha256Signer;
  readonly #signaturePayloadBuilder: BaseStringBuilder;
  #liveSessionToken?: { value: string; expiration: Date };
  #liveSessionTokenPromise?: Promise<string>;
  #liveSessionTokenComputer: LiveSessionTokenComputer;

  constructor({
    httpClient,
    consumerKey,
    diffieHellmanPrime,
    accessTokenSecret,
    signaturePrivateKey,
    timeProvider,
    randomBigIntGenerator,
  }: {
    httpClient: HttpClient;
    consumerKey: string;
    diffieHellmanPrime: string | bigint;
    accessTokenSecret: string | Uint8Array<ArrayBuffer>;
    signaturePrivateKey: string | Uint8Array<ArrayBuffer>;
    timeProvider?: TimeProviderInterface;
    randomBigIntGenerator?: RandomBigIntGeneratorInterface;
  }) {
    this.#httpClient = httpClient;
    this.#timeProvider = timeProvider ?? new TimeProvider();
    this.#signer = new RsaSha256Signer(signaturePrivateKey);
    this.#signaturePayloadBuilder = new BaseStringBuilder(accessTokenSecret);
    this.#liveSessionTokenComputer = new LiveSessionTokenComputer({
      consumerKey,
      accessTokenSecret,
      diffieHellmanPrime,
      randomBigIntGenerator,
    });
  }

  async #getLiveSessionToken() {
    this.#liveSessionToken = await this.#liveSessionTokenComputer.computeLiveSessionToken(async (challenge) => {
      return await this.#httpClient.request('/oauth/live_session_token', {
        method: 'POST',
        additionalAuthenticationParams: { diffie_hellman_challenge: challenge },
        signer: this.#signer,
        signaturePayloadBuiler: this.#signaturePayloadBuilder,
        parseFn(body) {
          return z.object({
            diffie_hellman_response: z.string(),
            live_session_token_signature: z.string(),
            live_session_token_expiration: z.number().transform((value) => new Date(value)),
          }).transform(({ diffie_hellman_response, live_session_token_signature, live_session_token_expiration }) => ({
            diffieHellmanResponse: diffie_hellman_response,
            liveSessionTokenSignature: live_session_token_signature,
            liveSessionTokenExpiration: live_session_token_expiration,
          })).parse(body);
        },
      });
    });
    return this.#liveSessionToken.value;
  }

  async getLiveSessionToken() {
    if (
      this.#liveSessionToken !== undefined &&
      this.#liveSessionToken.expiration.valueOf() > this.#timeProvider.now().valueOf() - 60e3
    ) {
      return this.#liveSessionToken.value;
    }
    if (this.#liveSessionTokenPromise === undefined) {
      this.#liveSessionTokenPromise = this.#getLiveSessionToken().finally(() => {
        this.#liveSessionTokenPromise = undefined;
      });
    }
    return await this.#liveSessionTokenPromise;
  }
}
