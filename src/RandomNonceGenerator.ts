import type RandomNonceGeneratorInterface from './RandomNonceGeneratorInterface.ts';

export default class RandomNonceGenerator implements RandomNonceGeneratorInterface {
  #randomNonce?: string | (() => string);

  constructor(randomNonce?: string | (() => string)) {
    this.#randomNonce = randomNonce;
  }

  randomNonce(): string {
    if (this.#randomNonce !== undefined) {
      if (typeof this.#randomNonce === 'function') {
        return this.#randomNonce();
      }
      return this.#randomNonce;
    }
    return crypto.randomUUID();
  }
}
