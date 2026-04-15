import { toBigUintBE } from '@quentinadam/uint8array-extension';
import type { RandomBigIntGeneratorInterface } from './RandomBigIntGeneratorInterface.ts';

export class RandomBigIntGenerator implements RandomBigIntGeneratorInterface {
  #randomBigInt?: bigint | ((byteLength: number) => bigint);

  constructor(randomBigInt?: bigint | ((byteLength: number) => bigint)) {
    this.#randomBigInt = randomBigInt;
  }

  randomBigInt(byteLength: number): bigint {
    if (this.#randomBigInt !== undefined) {
      if (typeof this.#randomBigInt === 'function') {
        return this.#randomBigInt(byteLength);
      }
      return this.#randomBigInt;
    }
    return toBigUintBE(crypto.getRandomValues(new Uint8Array(byteLength)));
  }
}
