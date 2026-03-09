# @quentinadam/ibkr

[![JSR][jsr-image]][jsr-url] [![NPM][npm-image]][npm-url] [![CI][ci-image]][ci-url]

A client for the Interactive Brokers (IBKR) Web API with OAuth 1.0a authentication.

## Installation

```bash
# Deno
deno add jsr:@quentinadam/ibkr

# npm
npm install @quentinadam/ibkr
```

## Credential generation

To set up OAuth credentials for the IBKR Web API, access the
[OAuth Self-Service Portal](https://ndcdyn.interactivebrokers.com/sso/Login?action=OAUTH&RL=1&ip2loc=US) and log in with
the username you want to use for your API sessions.

### Setup steps

1. **Choose a consumer key** (9 characters)

2. **Generate and upload RSA key pairs** for signing and encryption:

   ```bash
   # Signature key pair
   openssl genrsa -out private_signature.pem 2048
   openssl rsa -in private_signature.pem -outform PEM -pubout -out public_signature.pem

   # Encryption key pair
   openssl genrsa -out private_encryption.pem 2048
   openssl rsa -in private_encryption.pem -outform PEM -pubout -out public_encryption.pem
   ```

   Upload the public keys (`public_signature.pem` and `public_encryption.pem`) to the portal.

3. **Generate and upload a Diffie-Hellman prime**:

   ```bash
   openssl dhparam -outform PEM 2048 -out dhparam.pem
   ```

   Upload the generated `dhparam.pem` file to the portal.

4. **Generate the access token** and encrypted access token secret via the portal.

### Preparing credentials for use

After generating credentials through the portal, you need to prepare them for use with this library.

#### Converting the signature key to PKCS8 format

The `signaturePrivateKey` must be provided in **PKCS8 format**. The `private_signature.pem` file generated above is in
PKCS1 format by default. Convert it to PKCS8 format using:

```bash
openssl pkcs8 -topk8 -inform PEM -outform PEM -in private_signature.pem -nocrypt
```

A PKCS8 private key starts with `-----BEGIN PRIVATE KEY-----` and ends with `-----END PRIVATE KEY-----` (note: no "RSA"
in the header and footer, unlike PKCS1 format).

The private key can be provided in three ways:

1. **Full PEM format** (including header and footer):

   ```typescript
   const signaturePrivateKey = '-----BEGIN PRIVATE KEY-----\MIICdwIBADANBgkq...\n-----END PRIVATE KEY-----';
   ```

2. **Base64-encoded key only** (without header and footer):

   ```typescript
   const signaturePrivateKey = 'MIICdwIBADANBgkq...';
   ```

3. **Uint8Array** (raw PKCS8 bytes):

   ```typescript
   const signaturePrivateKey = Uint8Array.fromBase64('MIICdwIBADANBgkq...');
   ```

#### Decrypting the access token secret

Decrypt the encrypted access token secret from the portal using:

```bash
echo -n "ACCESS_TOKEN_SECRET" | base64 -d | openssl pkeyutl -decrypt -inkey private_encryption.pem | xxd -p -c 0
```

Replace `ACCESS_TOKEN_SECRET` with the actual encrypted secret from the portal. This outputs the decrypted secret as a
hex string.

The `accessTokenSecret` can be provided in two ways:

1. **Hex string** (output from the decryption command):

   ```typescript
   const accessTokenSecret = 'a1b2c3d4e5f6...'; // hex string from the decryption command
   ```

2. **Uint8Array** (raw bytes):

   ```typescript
   const accessTokenSecret = Uint8Array.fromHex('a1b2c3d4e5f6...');
   ```

#### Extracting the Diffie-Hellman prime

The `diffieHellmanPrime` must be provided as a **big-endian hex string** or as a **bigint**. Extract the hex string from
the `dhparam.pem` file using:

```bash
openssl dhparam -in dhparam.pem -text -noout \
| sed -n '/prime:/,/generator:/p' \
| grep -Ev 'prime|generator' \
| tr -d ' :\n' \
| sed 's/^00//'
```

The prime can be provided in two ways:

1. **Hex string** (big-endian):

   ```typescript
   const diffieHellmanPrime = 'ed016e7a503ade7c...'; // hex string from above command
   ```

2. **BigInt**:

   ```typescript
   const diffieHellmanPrime = 0xed016e7a503ade7c...n; // bigint literal
   ```

## Usage

### Importing the library

```typescript
import ApiClient from '@quentinadam/ibkr';
```

### Creating an API client

```typescript
const apiClient = new ApiClient({
  baseUrl, // optional - defaults to 'https://api.ibkr.com/v1/api'
  consumerKey, // required - your 9-character consumer key
  accessToken, // required - the access token from the portal
  accessTokenSecret, // required - the decrypted access token secret (hex string or Uint8Array)
  signaturePrivateKey, // required - your private signature key in PKCS8 format (string or Uint8Array)
  diffieHellmanPrime, // required - the DH prime as a big-endian hex string or bigint
  realm, // optional - the OAuth realm, defaults to 'limited_poa'
  logger, // optional - custom logger implementation
  randomNonceGenerator, // optional - custom nonce generator (mostly for testing purposes)
  randomBigIntGenerator, // optional - custom BigInt generator (mostly for testing purposes)
  timeProvider, // optional - custom time provider (mostly for testing purposes)
});
```

### Making API requests

The `request` method is used to make authenticated API requests. It accepts the following options:

- `method` (optional): HTTP method - `'GET'`, `'POST'`, or `'DELETE'` (defaults to `'GET'`)
- `headers` (optional): Additional HTTP headers
- `body` (optional): Request body as a string
- `signal` (optional): An `AbortSignal` to cancel the request
- `parseFn` (required): Function to parse and validate the response body

Example:

```typescript
const result = await apiClient.request('/iserver/accounts', {
  parseFn(body) {
    // Parse and validate the response body
    return body;
  },
});
```

### Initializing the brokerage session

Before making other API requests, you must initialize the brokerage session:

```typescript
await apiClient.request('/iserver/auth/ssodh/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ publish: true, compete: true }),
  parseFn(body) {
    // Parse and validate the response body
    return body;
  },
});
```

[ci-image]: https://img.shields.io/github/actions/workflow/status/quentinadam/deno-ibkr/ci.yml?branch=main&logo=github&style=flat-square
[ci-url]: https://github.com/quentinadam/deno-ibkr/actions/workflows/ci.yml
[npm-image]: https://img.shields.io/npm/v/@quentinadam/ibkr.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@quentinadam/ibkr
[jsr-image]: https://jsr.io/badges/@quentinadam/ibkr?style=flat-square
[jsr-url]: https://jsr.io/@quentinadam/ibkr
