export default class SignaturePayloadBuilder {
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
    const parametersString = new URLSearchParams([
      ...Object.entries(authenticationParams),
      ...new URL(url).searchParams.entries(),
    ].toSorted(([a], [b]) => a.localeCompare(b))).toString();
    return `${this.#prepend}${method}&${encodeURIComponent(url)}&${encodeURIComponent(parametersString)}`;
  }
}
