export class BaseStringBuilder {
  readonly #prepend: string;

  constructor(prepend?: string | Uint8Array<ArrayBuffer>) {
    this.#prepend = prepend !== undefined ? (typeof prepend === 'string' ? prepend : prepend.toHex()) : '';
  }

  buildSignerPayload({ method, url, authenticationParams }: {
    method: 'GET' | 'POST' | 'DELETE';
    url: string;
    authenticationParams: Record<string, string>;
    prepend?: string | Uint8Array<ArrayBuffer>;
  }): string {
    const { origin, pathname, searchParams } = new URL(url);
    const parametersString = [
      ...Object.entries(authenticationParams),
      ...searchParams.entries(),
    ].toSorted(([keyA, valueA], [keyB, valueB]) => {
      if (keyA !== keyB) {
        return keyA.localeCompare(keyB);
      }
      return valueA.localeCompare(valueB);
    }).map(([key, value]) => `${key}=${value}`).join('&');
    return `${this.#prepend}${method}&${encodeURIComponent(origin + pathname)}&${encodeURIComponent(parametersString)}`;
  }
}
