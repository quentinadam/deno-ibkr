import { assert } from '@quentinadam/assert';
import { RandomBigIntGenerator } from './RandomBigIntGenerator.ts';
import type { RandomBigIntGeneratorInterface } from './RandomBigIntGeneratorInterface.ts';

export class DiffieHellman {
  readonly prime: bigint;
  readonly generator: bigint;
  readonly #randomBigIntGenerator: RandomBigIntGeneratorInterface;

  constructor({ generator, prime, randomBigIntGenerator }: {
    generator: bigint;
    prime: bigint;
    randomBigIntGenerator?: RandomBigIntGeneratorInterface;
  }) {
    this.generator = generator;
    this.prime = prime;
    this.#randomBigIntGenerator = randomBigIntGenerator ?? new RandomBigIntGenerator();
    assert(this.prime > 2n, 'Prime must be > 2');
    assert(this.generator > 1n && this.generator < this.prime, 'Generator must be in (1, p)');
  }

  generateKeyPair() {
    const privateKey = this.#generatePrivateKey();
    const publicKey = this.#exponentiate({ value: this.generator, exponent: privateKey });
    return { privateKey, publicKey };
  }

  #generatePrivateKey(): bigint {
    const byteLength = (this.prime.toString(2).length + 7) >> 3;
    while (true) {
      const privateKey = this.#randomBigIntGenerator.randomBigInt(byteLength);
      if (privateKey > 1n && privateKey <= this.prime) {
        return privateKey;
      }
    }
  }

  #exponentiate({ value, exponent }: { value: bigint; exponent: bigint }): bigint {
    let result = 1n;
    while (exponent > 0n) {
      if ((exponent & 1n) === 1n) {
        result = (result * value) % this.prime;
      }
      exponent >>= 1n;
      value = (value ** 2n) % this.prime;
    }
    return result;
  }

  computeSharedSecret({ privateKey, peerPublicKey }: { privateKey: bigint; peerPublicKey: bigint }): bigint {
    assert(peerPublicKey > 1n && peerPublicKey < this.prime - 1n, 'Peer public key must be in (1, p-1)');
    return this.#exponentiate({ exponent: privateKey, value: peerPublicKey });
  }
}
