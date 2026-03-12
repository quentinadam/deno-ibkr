import * as z from '@quentinadam/zod';
import type AuthenticationStringBuilder from './AuthenticationStringBuilder.ts';
import type Signer from './Signer.ts';
import ApiError from './ApiError.ts';
import type LoggerInterface from './LoggerInterface.ts';
import type BaseStringBuilder from './BaseStringBuilder.ts';

export default class HttpClient {
  readonly #baseUrl: string;
  readonly #authenticationStringBuilder: AuthenticationStringBuilder;
  readonly #logger?: LoggerInterface;

  constructor({ baseUrl = 'https://api.ibkr.com/v1/api', authenticationStringBuilder, logger }: {
    baseUrl?: string;
    authenticationStringBuilder: AuthenticationStringBuilder;
    logger?: LoggerInterface;
  }) {
    this.#baseUrl = baseUrl;
    this.#authenticationStringBuilder = authenticationStringBuilder;
    this.#logger = logger;
  }

  async request<T>(path: string, {
    method = 'GET',
    headers,
    body,
    signal,
    additionalAuthenticationParams,
    signaturePayloadBuiler,
    signer,
    parseFn,
  }: {
    method?: 'GET' | 'POST' | 'DELETE';
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
    additionalAuthenticationParams?: Record<string, string>;
    signaturePayloadBuiler: BaseStringBuilder;
    signer: Signer;
    parseFn: (body: unknown) => T;
  }): Promise<T> {
    const url = `${this.#baseUrl}${path}`;
    this.#logger?.log(method, url, body ?? '');
    const authenticationString = await this.#authenticationStringBuilder.buildAuthenticationString({
      method,
      url,
      additionalAuthenticationParams,
      signaturePayloadBuiler,
      signer,
    });
    headers = { 'Authorization': `OAuth ${authenticationString}`, ...headers };
    const response = await fetch(url, { method, headers, body, signal });
    const text = await response.text();
    this.#logger?.log(response.status, text);
    if (!response.ok) {
      const message = (() => {
        try {
          return z.object({ error: z.string() }).parse(JSON.parse(text)).error;
        } catch {
          return text;
        }
      })();
      throw new ApiError({ status: response.status, message });
    }
    return parseFn(JSON.parse(text));
  }
}
