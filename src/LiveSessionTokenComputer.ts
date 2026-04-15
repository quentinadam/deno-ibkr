import { assert } from '@quentinadam/assert';
import { fromIntBE } from '@quentinadam/uint8array-extension';
import { DiffieHellman } from './DiffieHellman.ts';
import type { RandomBigIntGeneratorInterface } from './RandomBigIntGeneratorInterface.ts';

type MaybePromise<T> = T | Promise<T>;

async function hmacSha1(secret: Uint8Array<ArrayBuffer>, payload: Uint8Array<ArrayBuffer>) {
  const algorithm = { name: 'HMAC', hash: 'SHA-1' };
  const key = await crypto.subtle.importKey('raw', secret, algorithm, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, payload));
}

export class LiveSessionTokenComputer {
  readonly #consumerKey: Uint8Array<ArrayBuffer>;
  readonly #accessTokenSecret: Uint8Array<ArrayBuffer>;
  readonly #diffieHellman: DiffieHellman;

  constructor({ consumerKey, accessTokenSecret, diffieHellmanPrime, randomBigIntGenerator }: {
    consumerKey: string;
    accessTokenSecret: string | Uint8Array<ArrayBuffer>;
    diffieHellmanPrime: string | bigint;
    randomBigIntGenerator?: RandomBigIntGeneratorInterface;
  }) {
    this.#consumerKey = new TextEncoder().encode(consumerKey);
    this.#accessTokenSecret = typeof accessTokenSecret === 'string'
      ? Uint8Array.fromHex(accessTokenSecret)
      : accessTokenSecret;
    this.#diffieHellman = new DiffieHellman({
      generator: 2n,
      prime: typeof diffieHellmanPrime === 'bigint' ? diffieHellmanPrime : BigInt('0x' + diffieHellmanPrime),
      randomBigIntGenerator,
    });
  }

  async computeLiveSessionToken(
    fn: (diffieHellmanChallenge: string) => MaybePromise<{
      diffieHellmanResponse: string;
      liveSessionTokenSignature: string;
      liveSessionTokenExpiration: Date;
    }>,
  ): Promise<{ value: string; expiration: Date }> {
    const { privateKey, publicKey } = this.#diffieHellman.generateKeyPair();
    const {
      diffieHellmanResponse,
      liveSessionTokenSignature,
      liveSessionTokenExpiration,
    } = await fn(publicKey.toString(16));
    const secret = this.#diffieHellman.computeSharedSecret({
      privateKey,
      peerPublicKey: BigInt('0x' + diffieHellmanResponse),
    });
    const liveSessionToken = await hmacSha1(fromIntBE(secret), this.#accessTokenSecret);
    assert(liveSessionTokenSignature === (await hmacSha1(liveSessionToken, this.#consumerKey)).toHex());
    return { value: liveSessionToken.toBase64(), expiration: liveSessionTokenExpiration };
  }
}
