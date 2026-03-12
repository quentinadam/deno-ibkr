import SessionManager from './SessionManager.ts';
import HttpClient from './HttpClient.ts';
import HmacSha256Signer from './HmacSha256Signer.ts';
import AuthenticationStringBuilder from './AuthenticationStringBuilder.ts';
import type RandomNonceGeneratorInterface from './RandomNonceGeneratorInterface.ts';
import type TimeProviderInterface from './TimeProviderInterface.ts';
import type RandomBigIntGeneratorInterface from './RandomBigIntGeneratorInterface.ts';
import type LoggerInterface from './LoggerInterface.ts';
import BaseStringBuilder from './BaseStringBuilder.ts';

export default class ApiClient {
  readonly #sessionManager: SessionManager;
  readonly #httpClient: HttpClient;

  constructor({
    baseUrl,
    consumerKey,
    accessToken,
    accessTokenSecret,
    signaturePrivateKey,
    diffieHellmanPrime,
    realm,
    logger,
    randomNonceGenerator,
    randomBigIntGenerator,
    timeProvider,
  }: {
    baseUrl?: string;
    consumerKey: string;
    accessToken: string;
    accessTokenSecret: string | Uint8Array<ArrayBuffer>;
    signaturePrivateKey: string | Uint8Array<ArrayBuffer>;
    diffieHellmanPrime: string | bigint;
    realm?: string;
    logger?: LoggerInterface;
    randomNonceGenerator?: RandomNonceGeneratorInterface;
    randomBigIntGenerator?: RandomBigIntGeneratorInterface;
    timeProvider?: TimeProviderInterface;
  }) {
    this.#httpClient = new HttpClient({
      baseUrl,
      authenticationStringBuilder: new AuthenticationStringBuilder({
        consumerKey,
        accessToken,
        realm,
        randomNonceGenerator,
        timeProvider,
      }),
      logger,
    });
    this.#sessionManager = new SessionManager({
      httpClient: this.#httpClient,
      consumerKey,
      accessTokenSecret,
      signaturePrivateKey,
      diffieHellmanPrime,
      timeProvider,
      randomBigIntGenerator,
    });
  }

  async request<T>(path: string, { method, headers, body, signal, parseFn }: {
    method?: 'GET' | 'POST' | 'DELETE';
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
    parseFn: (body: unknown) => T;
  }): Promise<T> {
    const liveSessionToken = await this.#sessionManager.getLiveSessionToken();
    return await this.#httpClient.request(path, {
      method,
      headers,
      body,
      signaturePayloadBuiler: new BaseStringBuilder(),
      signer: new HmacSha256Signer(Uint8Array.fromBase64(liveSessionToken)),
      signal,
      parseFn,
    });
  }
}
