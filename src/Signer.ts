export class Signer {
  readonly #sign: (payload: Uint8Array<ArrayBuffer>) => Promise<ArrayBuffer>;
  readonly method: string;

  constructor(method: string, sign: (payload: Uint8Array<ArrayBuffer>) => Promise<ArrayBuffer>) {
    this.method = method;
    this.#sign = sign;
  }

  async sign(payload: string): Promise<string> {
    return new Uint8Array(await this.#sign(new TextEncoder().encode(payload))).toBase64();
  }
}
