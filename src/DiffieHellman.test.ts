import { assert } from '@quentinadam/assert';
import { DiffieHellman } from './DiffieHellman.ts';
import { RandomBigIntGenerator } from './RandomBigIntGenerator.ts';

Deno.test('DiffieHellman', () => {
  const vector = {
    prime: 0xed016e7a503ade7c29060cc6c374296984cced37004e12b6fd104111c4a0712bn,
    privateKey: 0x2c093bfcaf858b676e8b81070e1f9b9e55f2000fe1e730dc0fe4bfcecc76f2b9n,
    publicKey: 0x7d04de39dec12123f206ba594052de12115dc493fa70b1b7497f640d6f6574fn,
    peerPublicKey: 0xb0d05da3a25be9de6aec64fa10adb199a3df941aabed737e43d89d0a1a8e0111n,
    sharedSecret: 0x8d150c0e633a2aa00ee9d2da768e3717be0b7dba6a6e10f9e8b18c11ef89d0c0n,
  };
  const randomBigIntGenerator = new RandomBigIntGenerator(vector.privateKey);
  const diffieHellman = new DiffieHellman({ generator: 2n, prime: vector.prime, randomBigIntGenerator });
  const { privateKey, publicKey } = diffieHellman.generateKeyPair();
  assert(privateKey === vector.privateKey);
  assert(publicKey === vector.publicKey);
  const sharedSecret = diffieHellman.computeSharedSecret({ privateKey, peerPublicKey: vector.peerPublicKey });
  assert(sharedSecret === vector.sharedSecret);
});
