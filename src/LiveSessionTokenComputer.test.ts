import assert from '@quentinadam/assert';
import RandomBigIntGenerator from './RandomBigIntGenerator.ts';
import LiveSessionTokenComputer from './LiveSessionTokenComputer.ts';

Deno.test('LiveSessionTokenComputer', async () => {
  const vector = {
    consumerKey: 'ZCSGTLJAN',
    accessTokenSecret: 'be35c67ffb0452d0547c0d929565f7d1404cef05a63b582c496e3c401fd92603',
    diffieHellmanPrime: 'ed016e7a503ade7c29060cc6c374296984cced37004e12b6fd104111c4a0712b',
    randomBigInt: 0x2c093bfcaf858b676e8b81070e1f9b9e55f2000fe1e730dc0fe4bfcecc76f2b9n,
    diffieHellmanChallenge: '7d04de39dec12123f206ba594052de12115dc493fa70b1b7497f640d6f6574f',
    diffieHellmanResponse: 'b0d05da3a25be9de6aec64fa10adb199a3df941aabed737e43d89d0a1a8e0111',
    liveSessionTokenSignature: 'a2007306e162a8e9c69c217a4cd3c157e7a35803',
    liveSessionToken: 'vF0KfK5239p+7JfUbJmqFJFGkCE=',
  };
  const liveSessionTokenComputer = new LiveSessionTokenComputer({
    consumerKey: vector.consumerKey,
    accessTokenSecret: vector.accessTokenSecret,
    diffieHellmanPrime: vector.diffieHellmanPrime,
    randomBigIntGenerator: new RandomBigIntGenerator(vector.randomBigInt),
  });
  const { value: liveSessionToken } = await liveSessionTokenComputer.computeLiveSessionToken((challenge) => {
    assert(challenge === vector.diffieHellmanChallenge);
    return {
      diffieHellmanResponse: vector.diffieHellmanResponse,
      liveSessionTokenSignature: vector.liveSessionTokenSignature,
      liveSessionTokenExpiration: new Date(),
    };
  });
  assert(liveSessionToken === vector.liveSessionToken);
});
