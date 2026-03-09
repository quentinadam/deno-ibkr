import type TimeProviderInterface from './TimeProviderInterface.ts';

export default class TimeProvider implements TimeProviderInterface {
  readonly #now?: Date | (() => Date);

  constructor(now?: Date | (() => Date)) {
    this.#now = now;
  }

  now(): Date {
    if (this.#now) {
      if (typeof this.#now === 'function') {
        return this.#now();
      }
      return this.#now;
    }
    return new Date();
  }
}
