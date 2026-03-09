import * as Uint8ArrayExtension from '@quentinadam/uint8array-extension';
import type RandomBigIntGeneratorInterface from './RandomBigIntGeneratorInterface.ts';

export default class RandomBigIntGenerator implements RandomBigIntGeneratorInterface {
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
    return Uint8ArrayExtension.toBigUintBE(crypto.getRandomValues(new Uint8Array(byteLength)));
  }
}
